const STORAGE_KEY = "noticehub-admin-notices-v1";

const catClass = {
  Announcement: "cat-announcement",
  Events: "cat-events",
  Academics: "cat-academics",
  "Lost & found": "cat-lost"
};

const state = {
  notices: [],
  filter: "all",
  search: "",
  category: "Announcement",
  editingId: null,
  confirmId: null,
  firstRender: true
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const noticesEl = document.getElementById("notices");
const emptyEl = document.getElementById("empty");
const emptyTitle = document.getElementById("empty-title");
const emptyText = document.getElementById("empty-text");
const emptyAction = document.getElementById("empty-action");
const statsEl = document.getElementById("stats");
const searchEl = document.getElementById("search");
const filtersEl = document.getElementById("filters");
const formEl = document.getElementById("notice-form");
const formTitleEl = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-edit");
const titleInput = document.getElementById("f-title");
const detailsInput = document.getElementById("f-details");
const dateInput = document.getElementById("f-date");
const timeInput = document.getElementById("f-time");

function seed() {
  const now = Date.now();
  return [
    { id: uid(), title: "Library hours extend for finals week", category: "Announcement", text: "Open until 1 AM from May 4. Quiet floors stay quiet.", createdAt: now - 2 * 3600e3 },
    { id: uid(), title: "Basketball tryouts — Wednesday 5 PM", category: "Events", text: "Courts B. Bring water and your student ID.", createdAt: now - 26 * 3600e3 },
    { id: uid(), title: "Mid-semester survey needs 2 minutes", category: "Academics", text: "Your answers decide next semester's schedule. Deadline Friday.", createdAt: now - 5 * 3600e3 },
    { id: uid(), title: "Found: black umbrella near the Quad", category: "Lost & found", text: "Claim it at the front desk, second floor.", createdAt: now - 3 * 86400e3 },
    { id: uid(), title: "Semester mixer", category: "Events", text: "Music, food trucks, and the year's best playlist.", createdAt: now - 3600e3, scheduledAt: now + 2 * 86400e3 + 8 * 3600e3 }
  ];
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state.notices = JSON.parse(raw);
      return;
    }
  } catch (err) {
    state.notices = [];
  }
  state.notices = seed();
  save();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notices));
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return min + "m ago";
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + "h ago";
  const d = Math.floor(hr / 24);
  if (d < 7) return d + "d ago";
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function scheduleLabel(ts) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function isScheduled(n) {
  return Boolean(n.scheduledAt) && n.scheduledAt > Date.now();
}

function filtered() {
  const q = state.search.trim().toLowerCase();
  return state.notices
    .filter((n) => (state.filter === "all" ? true : n.category === state.filter))
    .filter((n) =>
      q
        ? n.title.toLowerCase().includes(q) ||
          n.text.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q)
        : true
    )
    .sort((a, b) => b.createdAt - a.createdAt);
}

function renderStats() {
  const live = state.notices.filter((n) => !isScheduled(n)).length;
  const scheduled = state.notices.length - live;
  statsEl.replaceChildren();
  statsEl.append(
    dot("green"),
    document.createTextNode(live + " live"),
    sep(),
    dot("amber"),
    document.createTextNode(scheduled + " scheduled"),
    sep(),
    dot("ink"),
    document.createTextNode(state.notices.length + " pinned")
  );
}

function dot(color) {
  const s = document.createElement("span");
  s.className = "stat-dot stat-dot-" + color;
  return s;
}

function sep() {
  const s = document.createElement("span");
  s.className = "stat-sep";
  s.textContent = "·";
  return s;
}

function buildCard(n, i) {
  const art = document.createElement("article");
  art.className = "notice " + (catClass[n.category] || catClass.Announcement);
  art.dataset.id = n.id;
  if (state.firstRender) {
    art.classList.add("pop-in");
    art.style.setProperty("--i", i);
  }

  const pin = document.createElement("span");
  pin.className = "pin";
  pin.setAttribute("aria-hidden", "true");

  const status = document.createElement("span");
  if (isScheduled(n)) {
    status.className = "status status-scheduled";
    const d = document.createElement("span");
    d.className = "status-dot";
    status.append(d, document.createTextNode("scheduled · " + scheduleLabel(n.scheduledAt)));
  } else {
    status.className = "status status-live";
    const d = document.createElement("span");
    d.className = "status-dot";
    status.append(d, document.createTextNode("live"));
  }

  const tag = document.createElement("p");
  tag.className = "notice-tag";
  tag.textContent = n.category;

  const title = document.createElement("h3");
  title.className = "notice-title";
  title.textContent = n.title;

  const text = document.createElement("p");
  text.className = "notice-text";
  text.textContent = n.text;

  const meta = document.createElement("p");
  meta.className = "notice-meta";
  const posted = document.createElement("span");
  posted.textContent = "posted " + timeAgo(n.createdAt);
  const num = document.createElement("span");
  num.textContent = "#" + String(i + 1).padStart(3, "0");
  meta.append(posted, num);

  const actions = document.createElement("div");
  actions.className = "notice-actions";

  if (state.confirmId === n.id) {
    const confirm = document.createElement("div");
    confirm.className = "confirm";
    const textP = document.createElement("p");
    textP.className = "confirm-text";
    textP.textContent = "Delete this notice?";
    const yes = actBtn("yes", "Yes, delete");
    const no = actBtn("no", "Cancel");
    confirm.append(textP, yes, no);
    actions.replaceChildren(confirm);
  } else {
    actions.append(actBtn("edit", "Edit"), actBtn("delete", "Delete"));
  }

  art.append(pin, status, tag, title, text, meta, actions);
  art.addEventListener(
    "animationend",
    () => {
      art.classList.remove("pop-in");
    },
    { once: true }
  );
  return art;
}

function actBtn(act, label) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "act act-" + act;
  b.dataset.act = act;
  b.textContent = label;
  return b;
}

function render() {
  const list = filtered();
  noticesEl.replaceChildren();
  list.forEach((n, i) => noticesEl.append(buildCard(n, i)));

  const isEmpty = list.length === 0;
  emptyEl.hidden = !isEmpty;
  if (isEmpty) {
    const filtering = state.search.trim() || state.filter !== "all";
    emptyTitle.textContent = filtering ? "Nothing matches that." : "Nothing pinned here yet.";
    emptyText.textContent = filtering
      ? "Try a different search or clear the filters."
      : "Write the first notice — it goes live as soon as you pin it.";
    emptyAction.textContent = filtering ? "Clear search & filters" : "Pin a notice";
  }

  renderStats();
  state.firstRender = false;
}

/* ---------- form ---------- */

function formCategory() {
  return state.category;
}

function setFormMode() {
  const editing = Boolean(state.editingId);
  formTitleEl.textContent = editing ? "Edit notice" : "New notice";
  submitBtn.textContent = editing ? "Save changes" : "Pin now";
  cancelBtn.hidden = !editing;
}

function resetForm() {
  state.editingId = null;
  state.confirmId = null;
  formEl.reset();
  titleInput.value = "";
  detailsInput.value = "";
  dateInput.value = "";
  timeInput.value = "";
  setCategory("Announcement");
  setFormMode();
}

function setCategory(cat) {
  state.category = cat;
  formEl.querySelectorAll("[data-cat]").forEach((b) => {
    b.classList.toggle("chip-active", b.dataset.cat === cat);
  });
}

function fillForm(n) {
  titleInput.value = n.title;
  detailsInput.value = n.text || "";
  setCategory(n.category);
  if (n.scheduledAt) {
    const d = new Date(n.scheduledAt);
    dateInput.value = toDateValue(d);
    timeInput.value = toTimeValue(d);
  } else {
    dateInput.value = "";
    timeInput.value = "";
  }
}

function toDateValue(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function toTimeValue(d) {
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

function parseSchedule() {
  if (!dateInput.value) return null;
  const time = timeInput.value || "09:00";
  const ts = new Date(dateInput.value + "T" + time).getTime();
  return Number.isNaN(ts) ? null : ts;
}

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    showTitleError();
    titleInput.focus();
    return;
  }
  clearTitleError();
  const data = {
    title: title,
    category: formCategory(),
    text: detailsInput.value.trim(),
    scheduledAt: parseSchedule()
  };

  if (state.editingId) {
    const target = state.notices.find((n) => n.id === state.editingId);
    if (target) Object.assign(target, data);
  } else {
    data.id = uid();
    data.createdAt = Date.now();
    state.notices.push(data);
  }

  save();
  resetForm();
  render();
  document.getElementById("notices").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
});

cancelBtn.addEventListener("click", () => {
  resetForm();
  render();
});

function showTitleError() {
  titleInput.classList.add("input-invalid");
  titleInput.setAttribute("aria-invalid", "true");
  titleError.hidden = false;
}

function clearTitleError() {
  titleInput.classList.remove("input-invalid");
  titleInput.removeAttribute("aria-invalid");
  titleError.hidden = true;
}

titleInput.addEventListener("input", clearTitleError);

emptyAction.addEventListener("click", () => {
  if (state.search.trim() || state.filter !== "all") {
    state.search = "";
    searchEl.value = "";
    state.filter = "all";
    filtersEl.querySelectorAll("[data-filter]").forEach((c) => {
      c.classList.toggle("chip-active", c.dataset.filter === "all");
    });
    render();
  } else {
    document.getElementById("compose").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }
});

/* ---------- events ---------- */

searchEl.addEventListener("input", () => {
  state.search = searchEl.value;
  render();
});

filtersEl.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-filter]");
  if (!b) return;
  state.filter = b.dataset.filter;
  filtersEl.querySelectorAll("[data-filter]").forEach((c) => {
    c.classList.toggle("chip-active", c.dataset.filter === state.filter);
  });
  render();
});

formEl.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-cat]");
  if (!b) return;
  setCategory(b.dataset.cat);
});

noticesEl.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-act]");
  if (!b) return;
  const card = e.target.closest(".notice");
  const id = card.dataset.id;
  const n = state.notices.find((x) => x.id === id);
  if (!n) return;

  if (b.dataset.act === "edit") {
    state.editingId = id;
    state.confirmId = null;
    fillForm(n);
    setFormMode();
    document.getElementById("compose").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  } else if (b.dataset.act === "delete") {
    state.confirmId = id;
    render();
  } else if (b.dataset.act === "yes") {
    state.notices = state.notices.filter((x) => x.id !== id);
    state.confirmId = null;
    save();
    render();
  } else if (b.dataset.act === "no") {
    state.confirmId = null;
    render();
  }
});

const titleError = document.getElementById("title-error");

/* ---------- init ---------- */

load();
render();
