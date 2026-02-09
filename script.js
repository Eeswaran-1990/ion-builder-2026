/* Ion Builder (H–Kr) — script.js
   - Works with your current index.html IDs
   - High contrast toggle: html[data-contrast="high" | "normal"]
   - First 36 elements, electron slider 1–36
*/

const elements = [
  { Z: 1, sym: "H", name: "Hydrogen" },
  { Z: 2, sym: "He", name: "Helium" },
  { Z: 3, sym: "Li", name: "Lithium" },
  { Z: 4, sym: "Be", name: "Beryllium" },
  { Z: 5, sym: "B", name: "Boron" },
  { Z: 6, sym: "C", name: "Carbon" },
  { Z: 7, sym: "N", name: "Nitrogen" },
  { Z: 8, sym: "O", name: "Oxygen" },
  { Z: 9, sym: "F", name: "Fluorine" },
  { Z: 10, sym: "Ne", name: "Neon" },
  { Z: 11, sym: "Na", name: "Sodium" },
  { Z: 12, sym: "Mg", name: "Magnesium" },
  { Z: 13, sym: "Al", name: "Aluminium" },
  { Z: 14, sym: "Si", name: "Silicon" },
  { Z: 15, sym: "P", name: "Phosphorus" },
  { Z: 16, sym: "S", name: "Sulfur" },
  { Z: 17, sym: "Cl", name: "Chlorine" },
  { Z: 18, sym: "Ar", name: "Argon" },
  { Z: 19, sym: "K", name: "Potassium" },
  { Z: 20, sym: "Ca", name: "Calcium" },
  { Z: 21, sym: "Sc", name: "Scandium" },
  { Z: 22, sym: "Ti", name: "Titanium" },
  { Z: 23, sym: "V", name: "Vanadium" },
  { Z: 24, sym: "Cr", name: "Chromium" },
  { Z: 25, sym: "Mn", name: "Manganese" },
  { Z: 26, sym: "Fe", name: "Iron" },
  { Z: 27, sym: "Co", name: "Cobalt" },
  { Z: 28, sym: "Ni", name: "Nickel" },
  { Z: 29, sym: "Cu", name: "Copper" },
  { Z: 30, sym: "Zn", name: "Zinc" },
  { Z: 31, sym: "Ga", name: "Gallium" },
  { Z: 32, sym: "Ge", name: "Germanium" },
  { Z: 33, sym: "As", name: "Arsenic" },
  { Z: 34, sym: "Se", name: "Selenium" },
  { Z: 35, sym: "Br", name: "Bromine" },
  { Z: 36, sym: "Kr", name: "Krypton" }
];

// Common charges for quick “challenge” practice (not exhaustive)
const commonIons = {
  H: [+1, -1],
  Li: [+1], Be: [+2], B: [+3],
  C: [-4, +4],
  N: [-3], O: [-2], F: [-1],
  Na: [+1], Mg: [+2], Al: [+3],
  Si: [-4, +4], P: [-3, +3, +5], S: [-2, +4, +6],
  Cl: [-1, +1, +3, +5, +7],
  K: [+1], Ca: [+2],
  Sc: [+3], Ti: [+2, +3, +4], V: [+2, +3, +4, +5],
  Cr: [+2, +3, +6], Mn: [+2, +4, +7], Fe: [+2, +3],
  Co: [+2, +3], Ni: [+2], Cu: [+1, +2], Zn: [+2],
  Ga: [+3], Ge: [+2, +4], As: [-3, +3, +5],
  Se: [-2, +4, +6], Br: [-1, +1, +3, +5, +7],
  Kr: [0]
};

// Filling order for first 36 electrons
const fillingOrder = [
  { label: "1s", n: 1, sub: "s", cap: 2 },
  { label: "2s", n: 2, sub: "s", cap: 2 },
  { label: "2p", n: 2, sub: "p", cap: 6 },
  { label: "3s", n: 3, sub: "s", cap: 2 },
  { label: "3p", n: 3, sub: "p", cap: 6 },
  { label: "4s", n: 4, sub: "s", cap: 2 },
  { label: "3d", n: 3, sub: "d", cap: 10 },
  { label: "4p", n: 4, sub: "p", cap: 6 }
];

// ===== DOM =====
const elSelect = document.getElementById("elementSelect");
const targetIon = document.getElementById("targetIon");

const zOut = document.getElementById("zOut");
const symOut = document.getElementById("symOut");
const chargeOut = document.getElementById("chargeOut");
const eCountOut = document.getElementById("eCount");

const spdfOut = document.getElementById("spdf");
const stabilityOut = document.getElementById("stability");
const shellsOut = document.getElementById("shells");
const orbitalViewOut = document.getElementById("orbitalView");

const slider = document.getElementById("slider");
const resultOut = document.getElementById("resultOut");
const srStatus = document.getElementById("srStatus");

const btnMinus = document.getElementById("minus");
const btnPlus = document.getElementById("plus");
const btnSetTarget = document.getElementById("setTarget");
const btnRandom = document.getElementById("randomChallenge");
const btnCheck = document.getElementById("check");
const btnContrast = document.getElementById("toggleContrast");

// ===== State =====
let Z = 12;         // default Mg
let electrons = 12; // default neutral Mg

// ===== Init dropdown =====
function initElements() {
  elSelect.innerHTML = "";
  for (const e of elements) {
    const opt = document.createElement("option");
    opt.value = String(e.Z);
    opt.textContent = `${e.sym} — ${e.name} (Z=${e.Z})`;
    if (e.Z === Z) opt.selected = true;
    elSelect.appendChild(opt);
  }
}

function getElement() {
  return elements.find(e => e.Z === Z) || elements[0];
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function fmtCharge(ch) {
  if (ch === 0) return "0";
  return ch > 0 ? `+${ch}` : `${ch}`;
}

function toSup(num) {
  const map = { "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹" };
  return String(num).split("").map(d => map[d] || d).join("");
}

function announce(msg) {
  if (srStatus) srStatus.textContent = msg;
}

function setResult(text, isCorrect = null) {
  resultOut.textContent = text;
  if (isCorrect === null) {
    resultOut.style.color = "";
  } else {
    resultOut.style.color = isCorrect ? "var(--good)" : "var(--bad)";
  }
  resultOut.style.fontWeight = "900";
}

// ===== Electron configuration =====
function buildConfig(e) {
  let remaining = e;
  const config = [];
  for (const sub of fillingOrder) {
    if (remaining <= 0) break;
    const take = Math.min(sub.cap, remaining);
    config.push({ ...sub, e: take });
    remaining -= take;
  }
  return config;
}

function spdfString(config) {
  return config.map(s => `${s.label}${toSup(s.e)}`).join(" ");
}

function shellsFromConfig(config) {
  const shells = {};
  for (const part of config) {
    shells[part.n] = (shells[part.n] || 0) + part.e;
  }
  const arr = [];
  for (let n = 1; n <= 4; n++) {
    const cap = (n === 1 ? 2 : n === 2 ? 8 : n === 3 ? 18 : 32);
    arr.push({ n, e: shells[n] || 0, cap });
  }
  return arr;
}

function outerShellInfo(shellArr) {
  const highest = [...shellArr].reverse().find(s => s.e > 0);
  if (!highest) return { n: 1, e: 0, full: false };
  const full = (highest.n === 1 && highest.e === 2) || (highest.n >= 2 && highest.e === 8);
  return { n: highest.n, e: highest.e, full };
}

// Hund simplified orbital boxes (shows ↑ then ↓)
function orbitalBoxes(subLabel, eCount) {
  const type = subLabel.slice(-1); // s/p/d
  const boxes = (type === "s" ? 1 : type === "p" ? 3 : type === "d" ? 5 : 7);

  let remaining = eCount;
  const states = Array.from({ length: boxes }, () => []);

  for (let i = 0; i < boxes && remaining > 0; i++) { states[i].push("↑"); remaining--; }
  for (let i = 0; i < boxes && remaining > 0; i++) { states[i].push("↓"); remaining--; }

  return states.map(st => st.join("") || " ");
}

// ===== Render UI =====
function renderShells(shellArr) {
  shellsOut.innerHTML = "";
  for (const s of shellArr) {
    // hide empty 4th shell box to keep it tidy
    if (s.n === 4 && s.e === 0) continue;

    const div = document.createElement("div");
    div.className = "shell";
    div.innerHTML = `<b>Shell n=${s.n}</b><br><span class="mono">${s.e} e⁻</span>`;
    shellsOut.appendChild(div);
  }
}

function renderOrbitals(config) {
  // We keep this simple + CSS-light (so it still looks good with your current style.css)
  orbitalViewOut.innerHTML = "";

  for (const sub of config) {
    const wrap = document.createElement("div");
    wrap.style.border = "1px solid var(--border)";
    wrap.style.borderRadius = "12px";
    wrap.style.padding = "10px";
    wrap.style.background = "var(--surface)";
    wrap.style.marginBottom = "10px";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.gap = "10px";
    header.innerHTML = `<b>${sub.label}</b> <span class="mono">${sub.label}${toSup(sub.e)} (${sub.sub}-block)</span>`;
    wrap.appendChild(header);

    const boxes = orbitalBoxes(sub.label, sub.e);
    const boxesRow = document.createElement("div");
    boxesRow.style.display = "flex";
    boxesRow.style.flexWrap = "wrap";
    boxesRow.style.gap = "6px";
    boxesRow.style.marginTop = "8px";

    for (const b of boxes) {
      const box = document.createElement("div");
      box.style.width = "44px";
      box.style.height = "34px";
      box.style.borderRadius = "12px";
      box.style.border = "1px solid var(--border)";
      box.style.display = "flex";
      box.style.alignItems = "center";
      box.style.justifyContent = "center";
      box.style.fontWeight = "900";
      box.style.background = "var(--bg)";
      box.textContent = `${b} ${sub.sub.toUpperCase()}`;
      boxesRow.appendChild(box);
    }

    wrap.appendChild(boxesRow);
    orbitalViewOut.appendChild(wrap);
  }
}

function updateIonTargets() {
  const sym = getElement().sym;
  const ions = commonIons[sym] || [0];

  targetIon.innerHTML = "";
  for (const ch of ions) {
    const opt = document.createElement("option");
    opt.value = String(ch);
    opt.textContent = fmtCharge(ch);
    targetIon.appendChild(opt);
  }
}

function setElectrons(val) {
  electrons = clamp(val, 1, 36);
  slider.value = String(electrons);
  render();
}

function render() {
  const el = getElement();

  zOut.textContent = String(Z);
  symOut.textContent = el.sym;

  eCountOut.textContent = String(electrons);

  const charge = Z - electrons;
  chargeOut.textContent = fmtCharge(charge);

  const config = buildConfig(electrons);
  spdfOut.textContent = spdfString(config);

  const shellArr = shellsFromConfig(config);
  renderShells(shellArr);

  const outer = outerShellInfo(shellArr);
  stabilityOut.textContent = outer.full
    ? "✅ Full outer shell pattern (noble gas-like stability idea)."
    : "Try adjusting electrons to reach a full outer shell (e.g., 2, 8 or 2, 8, 8).";

  renderOrbitals(config);
}

// ===== Events =====
elSelect.addEventListener("change", () => {
  Z = parseInt(elSelect.value, 10);
  setElectrons(Z);           // reset to neutral atom
  updateIonTargets();
  setResult("—", null);
  announce(`Element changed to ${getElement().name}.`);
});

btnMinus.addEventListener("click", () => setElectrons(electrons - 1));
btnPlus.addEventListener("click", () => setElectrons(electrons + 1));

slider.addEventListener("input", (e) => {
  setElectrons(parseInt(e.target.value, 10));
});

btnSetTarget.addEventListener("click", () => {
  const desiredCharge = parseInt(targetIon.value, 10);
  setElectrons(Z - desiredCharge);
  setResult("—", null);
  announce(`Set electrons to match target charge ${fmtCharge(desiredCharge)}.`);
});

btnRandom.addEventListener("click", () => {
  const sym = getElement().sym;
  const ions = commonIons[sym] || [];
  if (!ions.length) {
    alert("No preset common ions for this element. Try a different element.");
    return;
  }
  const desired = ions[Math.floor(Math.random() * ions.length)];
  targetIon.value = String(desired);

  // Make it a mini-game: start them slightly off target
  const targetE = Z - desired;
  const nudge = Math.random() < 0.5 ? 1 : -1;
  setElectrons(clamp(targetE + nudge, 1, 36));

  setResult("—", null);
  announce(`Random challenge: build charge ${fmtCharge(desired)}.`);
});

btnCheck.addEventListener("click", () => {
  const desiredCharge = parseInt(targetIon.value, 10);
  const currentCharge = Z - electrons;

  if (currentCharge === desiredCharge) {
    setResult("Correct ✅", true);
    announce("Correct ion built.");
  } else {
    setResult(`Not yet — you made ${fmtCharge(currentCharge)}`, false);
    announce(`Not yet. Current charge is ${fmtCharge(currentCharge)}.`);
  }
});

// High contrast toggle
btnContrast.addEventListener("click", () => {
  const root = document.documentElement;
  const isHigh = root.getAttribute("data-contrast") === "high";
  root.setAttribute("data-contrast", isHigh ? "normal" : "high");
  btnContrast.setAttribute("aria-pressed", String(!isHigh));
  announce(isHigh ? "High contrast off." : "High contrast on.");
});

// ===== Start =====
initElements();
updateIonTargets();
setElectrons(electrons);
setResult("—", null);
