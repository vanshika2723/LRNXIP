// Learnix Week 1 Landing Page interactions
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
    });
  });
}

document.getElementById("year").textContent = new Date().getFullYear();

const contactForm = document.getElementById("contactForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");
const trackSelect = document.getElementById("track");
const formFeedback = document.getElementById("formFeedback");

function setFieldError(input, errorId, message) {
  const errorElement = document.getElementById(errorId);
  errorElement.textContent = message;
  input.classList.toggle("invalid", Boolean(message));
  input.setAttribute("aria-invalid", String(Boolean(message)));
}

function validateName() {
  const value = nameInput.value.trim();
  const message = value.length < 2 ? "Please enter at least 2 characters." : "";
  setFieldError(nameInput, "nameError", message);
  return !message;
}

function validateEmail() {
  const value = emailInput.value.trim();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const message = !value ? "Email address is required." : (!emailPattern.test(value) ? "Enter a valid email address." : "");
  setFieldError(emailInput, "emailError", message);
  return !message;
}

function validateMessage() {
  const value = messageInput.value.trim();
  const message = value.length < 10 ? "Please write at least 10 characters." : "";
  setFieldError(messageInput, "messageError", message);
  return !message;
}

nameInput.addEventListener("blur", validateName);
emailInput.addEventListener("blur", validateEmail);
messageInput.addEventListener("blur", validateMessage);

[nameInput, emailInput, messageInput].forEach((input) => {
  input.addEventListener("input", () => {
    input.classList.remove("invalid");
    input.setAttribute("aria-invalid", "false");
  const errorId = `${input.id}Error`;
    const errorElement = document.getElementById(errorId);
    if (errorElement) errorElement.textContent = "";
    formFeedback.textContent = "";
    formFeedback.className = "form-feedback";
  });
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isMessageValid = validateMessage();

  if (!isNameValid || !isEmailValid || !isMessageValid) {
    formFeedback.textContent = "Please fix the highlighted fields and try again.";
    formFeedback.className = "form-feedback error";
    const firstInvalid = contactForm.querySelector(".invalid");
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const selectedTrack = trackSelect.value || "Not specified";
  formFeedback.textContent = `Thanks, ${nameInput.value.trim()}! Your form passed validation. (Selected track: ${selectedTrack}) This demo does not send data to a server yet.`;
  formFeedback.className = "form-feedback success";
  contactForm.reset();
  [nameInput, emailInput, messageInput].forEach((input) => input.setAttribute("aria-invalid", "false"));
});

document.querySelectorAll("[data-track]").forEach((link) => {
  link.addEventListener("click", () => {
    const track = link.getAttribute("data-track");
    trackSelect.value = track;
  });
});

// Highlight the active navigation link while scrolling through page sections.
const sections = document.querySelectorAll("main section[id], section[id]");
const navItems = document.querySelectorAll(".nav-link");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navItems.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach((section) => observer.observe(section));
}
