const displayEl = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
let expression = '';
const MAX_LENGTH = 25;

function refresh() {
  displayEl.textContent = expression || '0';
}

function append(value) {
  if (expression.length >= MAX_LENGTH) return;

  const operators = ['+', '-', '×', '÷'];

  // Prevent multiple decimals
  if (value === '.') {
    let lastNumber = expression.split(/[-+×÷]/).pop();
    if (lastNumber.includes('.')) return;
  }

  // Prevent leading operator (except "-")
  if (expression === '' && operators.includes(value) && value !== '-') return;

  // Prevent double operators
  if (operators.includes(value) && operators.includes(expression.slice(-1))) {
    expression = expression.slice(0, -1) + value; // replace last operator
  } else {
    expression += value;
  }

  refresh();
}

function back() {
  expression = expression.slice(0, -1);
  refresh();
}

function toggleSign() {
  if (expression === '') return;
  let lastNumber = expression.match(/-?\d+(\.\d+)?$/);
  if (lastNumber) {
    let num = lastNumber[0];
    let start = expression.lastIndexOf(num);
    if (num.startsWith('-')) num = num.slice(1);
    else num = '-' + num;
    expression = expression.slice(0, start) + num;
    refresh();
  }
}

function formatResult(result) {
  if (Math.abs(result) < 1e-12) return "0";
  if (result.toString().length > 12) return result.toExponential(8);
  return result.toString();
}

function calculate() {
  if (expression === '') {
    displayEl.textContent = '0';
    return;
  }
  try {
    let code = expression.replace(/×/g, '*').replace(/÷/g, '/');
    let result = Function('"use strict";return (' + code + ')')();

    if (!isFinite(result) || isNaN(result)) throw Error("Invalid");

    result = Math.round(result * 1e12) / 1e12;
    displayEl.textContent = formatResult(result);
    expression = result.toString();
  } catch (e) {
    displayEl.textContent = 'Error';
    expression = '';
  }
}

buttons.forEach(btn => {
  const val = btn.dataset.value;
  const action = btn.dataset.action;
  btn.addEventListener('click', () => {
    if (val !== undefined) append(val);
    else if (action) {
      if (action === 'clear') expression = '', refresh();
      else if (action === 'back') back();
      else if (action === 'plusminus') toggleSign();
      else if (action === 'equals') calculate();
    }
  });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (!isNaN(e.key)) append(e.key);
  else if (['+', '-', '*', '/'].includes(e.key)) {
    let val = e.key.replace('*', '×').replace('/', '÷');
    append(val);
  }
  else if (e.key === '.') append('.');
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace') back();
  else if (e.key === 'Escape') { expression = ''; refresh(); }
});
