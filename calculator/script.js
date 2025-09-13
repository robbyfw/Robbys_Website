// Robust calculation engine using integer arithmetic via BigInt to avoid JS float errors.
// Keeps UI exactly the same. Division by zero: non-zero/0 => Infinity, 0/0 => Error.

const displayEl = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
let expression = '';
const MAX_LENGTH = 25;      // input length limit
const DIV_PRECISION = 12;   // decimal digits for division results

function refresh() {
  displayEl.textContent = expression || '0';
}

// Append input safely (prevents multiple decimals / consecutive operators / leading operators)
function append(value) {
  if (expression.length >= MAX_LENGTH) return;

  const operators = ['+', '-', '×', '÷'];

  // prevent multiple decimals inside the same number
  if (value === '.') {
    let lastNumber = expression.split(/[-+×÷]/).pop();
    if (lastNumber.includes('.')) return;
    // allow leading '.' (will be parsed as 0.xxx)
  }

  // Prevent leading operator except '-' (unary minus)
  if (expression === '' && operators.includes(value) && value !== '-') return;

  const lastChar = expression.slice(-1);
  // replace consecutive operators (e.g. 5 + * -> replace + with *)
  if (operators.includes(value) && operators.includes(lastChar)) {
    expression = expression.slice(0, -1) + value;
    refresh();
    return;
  }

  expression += value;
  refresh();
}

function back() {
  expression = expression.slice(0, -1);
  refresh();
}

function toggleSign() {
  if (expression === '') return;
  let lastNumber = expression.match(/-?\d*\.?\d+$/);
  if (lastNumber) {
    let num = lastNumber[0];
    let start = expression.lastIndexOf(num);
    if (num.startsWith('-')) num = num.slice(1);
    else num = '-' + num;
    expression = expression.slice(0, start) + num;
    refresh();
  }
}

/* ----------------- Parser & big-int arithmetic helpers ----------------- */

// parse expression -> tokens (numbers and operators). Uses '*' and '/' for internal representation.
function tokenize(expr) {
  // normalize (should already be ascii once we replace below)
  let tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ') { i++; continue; }

    // operator + or * or /
    if (ch === '+' || ch === '*' || ch === '/') {
      tokens.push(ch);
      i++;
      continue;
    }

    // minus: could be unary if at start or after another operator
    if (ch === '-') {
      const prev = tokens.length ? tokens[tokens.length - 1] : null;
      if (!prev || prev === '+' || prev === '-' || prev === '*' || prev === '/') {
        // unary minus -> parse as beginning of number
        let j = i + 1;
        let num = '-';
        while (j < expr.length && (isDigit(expr[j]) || expr[j] === '.')) {
          num += expr[j];
          j++;
        }
        // invalid unary like '-' alone or '-.' -> treat as invalid
        if (num === '-' || num === '-.') return null;
        tokens.push(num);
        i = j;
        continue;
      } else {
        tokens.push(ch);
        i++;
        continue;
      }
    }

    // number (digits or starting with dot)
    if (isDigit(ch) || ch === '.') {
      let j = i;
      let num = '';
      while (j < expr.length && (isDigit(expr[j]) || expr[j] === '.')) {
        num += expr[j];
        j++;
      }
      // invalid multiple dots check will be done later
      tokens.push(num);
      i = j;
      continue;
    }

    // unknown char
    return null;
  }
  return tokens;
}

function isDigit(ch) {
  return ch >= '0' && ch <= '9';
}

// parse numeric token into { sign: 1|-1, int: BigInt(normalized integer), scale: number }
function parseNumberParts(numStr) {
  let sign = 1;
  if (numStr.startsWith('-')) {
    sign = -1;
    numStr = numStr.slice(1);
  }
  if (numStr === '' || numStr === '.') return { sign, int: 0n, scale: 0 };
  const parts = numStr.split('.');
  const intPart = parts[0] || '0';
  const fracPart = parts[1] || '';
  const scale = fracPart.length;
  let combined = (intPart + fracPart).replace(/^0+/, '') || '0';
  return { sign, int: BigInt(combined), scale };
}

function pow10(n) {
  return 10n ** BigInt(n);
}

function formatBigIntWithScale(big, scale) {
  if (big === 0n) return "0";
  let sign = big < 0n ? '-' : '';
  let absBig = big < 0n ? -big : big;
  let s = absBig.toString();
  if (scale === 0) return sign + s;
  if (s.length <= scale) {
    s = s.padStart(scale + 1, '0'); // ensure "0.xxx" style
  }
  const intPart = s.slice(0, -scale) || '0';
  let frac = s.slice(-scale).replace(/0+$/, ''); // trim trailing zeros
  if (frac === '') return sign + intPart;
  return sign + intPart + '.' + frac;
}

function addStrings(aStr, bStr) {
  const A = parseNumberParts(aStr);
  const B = parseNumberParts(bStr);
  const P = Math.max(A.scale, B.scale);
  const aScaled = BigInt(A.sign) * (A.int * pow10(P - A.scale));
  const bScaled = BigInt(B.sign) * (B.int * pow10(P - B.scale));
  const sum = aScaled + bScaled;
  return formatBigIntWithScale(sum, P);
}

function subtractStrings(aStr, bStr) {
  // a - b == a + (-b)
  const negB = (bStr.startsWith('-') ? bStr.slice(1) : '-' + bStr);
  return addStrings(aStr, negB);
}

function multiplyStrings(aStr, bStr) {
  const A = parseNumberParts(aStr);
  const B = parseNumberParts(bStr);
  const product = BigInt(A.sign * B.sign) * (A.int * B.int);
  const scale = A.scale + B.scale;
  return formatBigIntWithScale(product, scale);
}

function divideStrings(aStr, bStr, precision = DIV_PRECISION) {
  const A = parseNumberParts(aStr);
  const B = parseNumberParts(bStr);

  // denominator zero?
  if (B.int === 0n) {
    if (A.int === 0n) throw new Error('NaN'); // 0/0
    throw new Error('DIV_ZERO'); // x/0
  }

  // numerator and denominator as integers with scales
  // formula: (ai / 10^da) / (bi / 10^db) = (ai * 10^(db + P)) / (bi * 10^da) / 10^P
  const ai = A.int;
  const bi = B.int;
  const da = A.scale;
  const db = B.scale;

  const numerator = ai * pow10(db + precision);
  const denominator = bi * pow10(da);

  // integer division with rounding
  let quotient = numerator / denominator;
  let rem = numerator % denominator;
  // rounding: if remainder*2 >= denominator -> round up
  if (rem * 2n >= denominator) quotient += 1n;

  const signedQuotient = BigInt(A.sign * B.sign) * quotient;
  return formatBigIntWithScale(signedQuotient, precision);
}

/* Evaluate tokens: first * and / left-to-right, then + and - left-to-right */
function evaluateTokens(tokens) {
  // tokens should alternate: number, operator, number...
  if (!tokens || tokens.length === 0) throw new Error('Invalid');

  // validate tokens format and check numeric tokens don't have multiple dots
  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 0) { // number expected
      const num = tokens[i];
      if (typeof num !== 'string') throw new Error('Invalid');
      if ((num.match(/\./g) || []).length > 1) throw new Error('Invalid');
      if (num === '-' || num === '.') throw new Error('Invalid');
    } else {
      const op = tokens[i];
      if (!['+', '-', '*', '/'].includes(op)) throw new Error('Invalid');
    }
  }

  // first pass: handle * and /
  let stack = [];
  stack.push(tokens[0]);
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const next = tokens[i + 1];
    if (op === '*' || op === '/') {
      const left = stack.pop();
      try {
        let res;
        if (op === '*') res = multiplyStrings(left, next);
        else res = divideStrings(left, next, DIV_PRECISION); // may throw DIV_ZERO or NaN
        stack.push(res);
      } catch (e) {
        // rethrow to be handled above
        throw e;
      }
    } else {
      // plus or minus -> keep for next stage
      stack.push(op);
      stack.push(next);
    }
  }

  // second pass: addition/subtraction left-to-right
  let result = stack[0];
  for (let i = 1; i < stack.length; i += 2) {
    const op = stack[i];
    const next = stack[i + 1];
    if (op === '+') result = addStrings(result, next);
    else result = subtractStrings(result, next);
  }

  return result;
}

// Format final result string: trim trailing zeros and small zero, convert very large integers to exponential if needed
function formatResultString(str) {
  if (!str) return '0';
  if (str === '-0') return '0';
  // trim trailing zeros in fractional part
  if (str.includes('.')) {
    str = str.replace(/\.?0+$/, ''); // removes trailing zeros and optional dot
  }
  if (str === '-0') return '0';

  // if integer part extremely long, fallback to scientific via Number (rare; preserves readability)
  const absIntPart = (str.split('.')[0] || '0').replace('-', '');
  if (absIntPart.length > 15) {
    // best-effort fallback
    const asNum = Number(str);
    if (isFinite(asNum)) return asNum.toExponential(8);
  }
  return str;
}

/* ----------------- Main calculate flow ----------------- */
function calculate() {
  if (expression === '') {
    displayEl.textContent = '0';
    return;
  }
  try {
    // convert visible × ÷ to internal * /
    let code = expression.replace(/×/g, '*').replace(/÷/g, '/');

    // don't end with an operator
    if (/[\+\-\*\/]$/.test(code)) throw new Error('Invalid');

    const tokens = tokenize(code);
    if (!tokens) throw new Error('Invalid');

    const resultStr = evaluateTokens(tokens); // may throw DIV_ZERO or NaN

    const formatted = formatResultString(resultStr);
    displayEl.textContent = formatted;
    expression = formatted; // allow chaining
  } catch (e) {
    if (e.message === 'DIV_ZERO') {
      // show Infinity for non-zero/0
      displayEl.textContent = 'Infinity';
      expression = '';
      return;
    }
    // 0/0 or any other invalid operation
    displayEl.textContent = 'Error';
    expression = '';
  }
}

/* ----------------- Wire up UI (buttons & keyboard) ----------------- */
buttons.forEach(btn => {
  const val = btn.dataset.value;
  const action = btn.dataset.action;
  btn.addEventListener('click', () => {
    if (val !== undefined) append(val);
    else if (action) {
      if (action === 'clear') { expression = ''; refresh(); }
      else if (action === 'back') back();
      else if (action === 'plusminus') toggleSign();
      else if (action === 'equals') calculate();
    }
  });
});

// keyboard support (keeps UI look unchanged; user asked not to change visuals)
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') append(e.key);
  else if (['+', '-', '*', '/'].includes(e.key)) {
    const val = e.key.replace('*', '×').replace('/', '÷');
    append(val);
  } else if (e.key === '.') append('.');
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace') back();
  else if (e.key === 'Escape') { expression = ''; refresh(); }
});
