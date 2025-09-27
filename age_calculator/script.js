// Sidebar toggle (copied behavior + accessibility update)
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");

hamburger.addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("open");
  hamburger.classList.toggle("active");
  hamburger.setAttribute("aria-expanded", String(isOpen));
  // for accessibility: hide the sidebar from assistive tech when closed
  sidebar.setAttribute("aria-hidden", String(!isOpen));
});

// Close sidebar when clicking outside (optional UX improvement)
document.addEventListener("click", (e) => {
  const target = e.target;
  if (!sidebar.contains(target) && !hamburger.contains(target) && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    sidebar.setAttribute("aria-hidden", "true");
  }
});

// AGE calculator logic
function calculateAgeFrom(dobString) {
  if (!dobString) return null;
  const today = new Date();
  const birthDate = new Date(dobString);
  if (isNaN(birthDate)) return null;

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    // days in previous month relative to today
    const daysInPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

const calcBtn = document.getElementById("calcBtn");
const resultEl = document.getElementById("result");
const dobInput = document.getElementById("dob");

calcBtn.addEventListener("click", () => {
  const dob = dobInput.value;
  if (!dob) {
    resultEl.textContent = "⚠️ Please select your date of birth.";
    return;
  }

  const age = calculateAgeFrom(dob);
  if (!age) {
    resultEl.textContent = "⚠️ Invalid date. Please try again.";
    return;
  }

  resultEl.textContent = `🎂 You are ${age.years} years, ${age.months} months, and ${age.days} days old.`;
});

// Allow Enter key to calculate when date input focused
dobInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    calcBtn.click();
  }
});