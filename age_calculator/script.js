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

// AGE calculator logic (improved UX: date max, instant calc on change, clear)
const calcBtn = document.getElementById("calcBtn");
const clearBtn = document.getElementById("clearBtn");
const resultEl = document.getElementById("result");
const dobInput = document.getElementById("dob");

// set max date to today to prevent future selection
(function setMaxDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const max = `${yyyy}-${mm}-${dd}`;
  dobInput.setAttribute('max', max);
  // optional: set a reasonable min (1900-01-01)
  dobInput.setAttribute('min', '1900-01-01');
})();

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
    const daysInPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

function renderResult(age) {
  if (!age) {
    resultEl.innerHTML = '';
    return;
  }

  // build pills
  const html = `
    <div class="pill-row" aria-hidden="false">
      <div class="pill">${age.years} yrs</div>
      <div class="pill">${age.months} mos</div>
      <div class="pill">${age.days} days</div>
    </div>
    <div class="msg">Exact age: ${age.years} years, ${age.months} months, and ${age.days} days.</div>
  `;
  resultEl.innerHTML = html;
}

// calculate on button click
calcBtn.addEventListener("click", () => {
  const dob = dobInput.value;
  if (!dob) {
    resultEl.innerHTML = `<div class="msg">Please select your date of birth above.</div>`;
    return;
  }
  const age = calculateAgeFrom(dob);
  if (!age) {
    resultEl.innerHTML = `<div class="msg">Invalid date. Please try again.</div>`;
    return;
  }
  renderResult(age);
});

// clear button
clearBtn.addEventListener("click", () => {
  dobInput.value = '';
  resultEl.innerHTML = '';
  dobInput.focus();
});

// instant calculate when date changes
dobInput.addEventListener("change", () => {
  const dob = dobInput.value;
  if (!dob) {
    resultEl.innerHTML = '';
    return;
  }
  const age = calculateAgeFrom(dob);
  renderResult(age);
});

// Enter key support
dobInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    calcBtn.click();
  }
});