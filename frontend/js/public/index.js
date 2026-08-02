document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const notices = document.querySelectorAll(".notice");
notices.forEach((notice) => {
  if (!reduceMotion) {
    notice.classList.add("will-pin");
  } else {
    notice.classList.add("pinned");
  }
});

if (!reduceMotion && notices.length) {
  window.requestAnimationFrame(() => {
    setTimeout(() => {
      notices.forEach((notice) => notice.classList.add("pinned"));
    }, 250);
    setTimeout(() => {
      notices.forEach((notice) => notice.classList.remove("will-pin"));
    }, 1500);
  });
}

const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el) => {
  if (reduceMotion) {
    el.classList.add("is-visible");
  } else {
    revealObserver.observe(el);
  }
});
