document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const form = document.getElementById("login-form");
const card = document.getElementById("login-card");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const pwdToggle = document.getElementById("pwd-toggle");
const forgotLink = document.getElementById("forgot-link");
const forgotNote = document.getElementById("forgot-note");
const submitBtn = document.getElementById("submit-btn");
const formAlert = document.getElementById("form-alert");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const emailField = document.getElementById("field-email");
const passwordField = document.getElementById("field-password");

const DEMO_EMAIL = "admin@noticehub.dev";
const DEMO_PASSWORD = "board123";

if (reduceMotion) {
  card.classList.add("pinned");
} else {
  window.requestAnimationFrame(() => {
    setTimeout(() => card.classList.add("pinned"), 60);
  });
}

function setFieldError(field, errorEl, message) {
  if (message) {
    field.classList.add("invalid");
    errorEl.textContent = message;
    errorEl.hidden = false;
  } else {
    field.classList.remove("invalid");
    errorEl.textContent = "";
    errorEl.hidden = true;
  }
}

function validateEmail() {
  const value = emailInput.value.trim();
  if (!value) return setFieldError(emailField, emailError, "Enter your email.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return setFieldError(emailField, emailError, "That doesn't look like an email — check for typos.");
  }
  setFieldError(emailField, emailError, "");
  return true;
}

function validatePassword() {
  if (!passwordInput.value) return setFieldError(passwordField, passwordError, "Enter your password.");
  setFieldError(passwordField, passwordError, "");
  return true;
}

emailInput.addEventListener("blur", validateEmail);
passwordInput.addEventListener("blur", validatePassword);

emailInput.addEventListener("input", () => {
  if (emailField.classList.contains("invalid")) validateEmail();
  hideFormAlert();
});

passwordInput.addEventListener("input", () => {
  if (passwordField.classList.contains("invalid")) validatePassword();
  hideFormAlert();
});

pwdToggle.addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  pwdToggle.setAttribute("aria-pressed", String(!showing));
  pwdToggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
});

forgotLink.addEventListener("click", () => {
  forgotNote.hidden = !forgotNote.hidden;
});

function showFormAlert(message) {
  formAlert.textContent = message;
  formAlert.hidden = false;
}

function hideFormAlert() {
  formAlert.hidden = true;
  formAlert.textContent = "";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  hideFormAlert();

  const emailOk = validateEmail();
  const passwordOk = validatePassword();
  if (!emailOk || !passwordOk) return;

  submitBtn.classList.add("is-loading");
  submitBtn.setAttribute("aria-busy", "true");
  submitBtn.querySelector(".btn-label").textContent = "Opening the board\u2026";

  setTimeout(() => {
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      submitBtn.classList.remove("is-loading");
      submitBtn.setAttribute("aria-busy", "false");
      submitBtn.querySelector(".btn-label").textContent = "Log in";
      showFormAlert("Wrong email or password. Double-check, or ask an admin for help.");
      return;
    }

    window.location.href = "../private/admin/dashboard.html";
  }, 900);
});
