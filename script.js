/* Ion Builder (H–Kr) — script.js
   Fixes:
   - Cr (Z=24): [Ar] 3d5 4s1
   - Cu (Z=29): [Ar] 3d10 4s1
   - For cations, remove electrons from 4p → 4s → 3d → ...
   - Transition metal badge + energy bands + targeted promotion animation
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

// Filling order up to 36 e-
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

const orbitalBadge = document.getElementById("orbitalBadge");
const energyBands = document.getElementById("energyBands");
const jumpWrap = document.getElementById("jumpWrap");
const jumpDot = document.getElementById("jumpDot");

// ===== State =====
let Z = 12;
let electrons = 12;

// ===== Utilities =====
function getElement() {
  return elements.find(e => e.Z === Z) || elements[0];
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function fmtCharge(ch) { return ch === 0 ? "0" : (ch > 0 ? `+${ch}` : `${ch}`); }
function toSup(num) {
  const map = { "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹" };
  return String(num).split("").map(d => map[d] || d).join("");
}
function announce(msg) { if (srStatus) srStatus.textContent = msg; }
function setResult(text, isCorrect = null) {
  resultOut.textContent = text;
  resultOut.style.color = (isCorrect === null) ? "" : (isCorrect ? "var(--good)" : "var(--bad)");
  resultOut.style.fontWeight = "900";
}

// ===== Init =====
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

// ===== Config builders =====
function buildAufbauConfig(e) {
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
function configToMap(config) {
  const map = {};
  for (const part of config) map[part.label] = part.e;
  return map;
}
function mapToConfig(map) {
  const out = [];
  for (const sub of fillingOrder) {
    const n = map[sub.label] || 0;
    if (n > 0) out.push({ ...sub, e: n });
  }
  return out;
}

/* ✅ CRITICAL FIX:
   Ensure Cr and Cu are forced AFTER Aufbau neutral build
   and ALSO "re-balanced" so total electrons stays exactly Z.
*/
function applyCrCuExceptionsForNeutral(Z, map) {
  if (Z === 24) {
    // Start from [Ar] then 3d5 4s1
    map["4s"] = 1;
    map["3d"] = 5;
  }
  if (Z === 29) {
    map["4s"] = 1;
    map["3d"] = 10;
  }

  // Safety: keep total electrons correct for neutral (prevents odd carry-over)
  const total = Object.values(map).reduce((a, b) => a + (b || 0), 0);
  if (total !== Z) {
    // Adjust by trimming from highest-energy (4p, 4s, 3d) if ever needed
    let diff = total - Z;
    const order = ["4p", "4s", "3d", "3p", "3s", "2p", "2s", "1s"];
    for (const orb of order) {
      if (diff <= 0) break;
      const have = map[orb] || 0;
      if (have <= 0) continue;
      const take = Math.min(have, diff);
      map[orb] = have - take;
      diff -= take;
    }
  }

  return map;
}

function removeElectrons(map, countToRemove) {
  const order = ["4p", "4s", "3d", "3p", "3s", "2p", "2s", "1s"];
  let remaining = countToRemove;

  for (const orb of order) {
    if (remaining <= 0) break;
    const have = map[orb] || 0;
    if (have <= 0) continue;
    const take = Math.min(have, remaining);
    map[orb] = have - take;
    remaining -= take;
  }
  return map;
}

function buildConfigForElement(Z, e) {
  // Build NEUTRAL for that element first (so exceptions apply properly)
  const neutralBase = buildAufbauConfig(Z);
  let neutralMap = configToMap(neutralBase);
  neutralMap = applyCrCuExceptionsForNeutral(Z, neutralMap);

  if (e === Z) return mapToConfig(neutralMap);

  if (e < Z) {
    const ionMap = { ...neutralMap };
    removeElectrons(ionMap, Z - e);
    return mapToConfig(ionMap);
  }

  // Anions: fill by Aufbau to e (fine at this level)
  const anion = buildAufbauConfig(e);
  return anion;
}

// ===== Shells + strings =====
function shellsFromConfig(config) {
  const shells = {};
  for (const part of config) shells[part.n] = (shells[part.n] || 0) + part.e;
  return [1,2,3,4].map(n => ({ n, e: shells[n] || 0 }));
}
function outerShellInfo(shellArr) {
  const highest = [...shellArr].reverse().find(s => s.e > 0);
  if (!highest) return { n: 1, e: 0, full: false };
  const full = (highest.n === 1 && highest.e === 2) || (highest.n >= 2 && highest.e === 8);
  return { n: highest.n, e: highest.e, full };
}
function spdfString(config) {
  return config.map(s => `${s.label}${toSup(s.e)}`).join(" ");
}

// Hund simplified
function orbitalBoxes(subLabel, eCount) {
  const type = subLabel.slice(-1);
  const boxes = (type === "s" ? 1 : type === "p" ? 3 : type === "d" ? 5 : 7);
  let remaining = eCount;
  const states = Array.from({ length: boxes }, () => []);
  for (let i = 0; i < boxes && remaining > 0; i++) { states[i].push("↑"); remaining--; }
  for (let i = 0; i < boxes && remaining > 0; i++) { states[i].push("↓"); remaining--; }
  return states.map(st => st.join("") || " ");
}

// ===== Render helpers =====
function renderShells(shellArr) {
  shellsOut.innerHTML = "";
  for (const s of shellArr) {
    if (s.n === 4 && s.e === 0) continue;
    const div = document.createElement("div");
    div.className = "shell";
    div.innerHTML = `<b>Shell n=${s.n}</b><br><span class="mono">${s.e} e⁻</span>`;
    shellsOut.appendChild(div);
  }
}

function renderOrbitals(config) {
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
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.flexWrap = "wrap";
    row.style.gap = "6px";
    row.style.marginTop = "8px";

    for (const b of boxes) {
      const box = document.createElement("div");
      box.classList.add("orb-box");
      box.dataset.orb = sub.label;

      const trimmed = (b || "").trim();
      if (trimmed === "↑") box.dataset.fill = "single";
      else if (trimmed === "↑↓") box.dataset.fill = "pair";
      else box.dataset.fill = "empty";

      box.textContent = b;
      row.appendChild(box);
    }

    wrap.appendChild(row);
    orbitalViewOut.appendChild(wrap);
  }
}

// ===== Promotion animation =====
function playPromotionAnimationBetween(fromEl, toEl) {
  if (!jumpDot || !jumpWrap || !fromEl || !toEl) return;

  const wrapRect = jumpWrap.getBoundingClientRect();
  const a = fromEl.getBoundingClientRect();
  const b = toEl.getBoundingClientRect();

  const x1 = (a.left + a.width / 2) - wrapRect.left - 5;
  const x2 = (b.left + b.width / 2) - wrapRect.left - 5;

  jumpDot.style.left = `${x1}px`;
  jumpDot.style.opacity = "0";

  const rise = -10;

  jumpDot.animate(
    [
      { transform: "translate(0px, 0px)", opacity: 0 },
      { transform: "translate(0px, 0px)", opacity: 1, offset: 0.15 },
      { transform: `translate(${x2 - x1}px, ${rise}px)`, opacity: 1, offset: 0.75 },
      { transform: `translate(${x2 - x1}px, ${rise}px)`, opacity: 0 }
    ],
    { duration: 950, easing: "ease-in-out", iterations: 1 }
  );
}

// ===== Main render =====
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

  // ✅ ALWAYS use element-aware builder (this is what fixes Cr reliably)
  const config = buildConfigForElement(Z, electrons);

  spdfOut.textContent = spdfString(config);

  const shellArr = shellsFromConfig(config);
  renderShells(shellArr);

  const isTransitionMetal = (Z >= 21 && Z <= 30);
  const dElectrons = (config.find(c => c.label === "3d") || {}).e || 0;
  const colourPossible = isTransitionMetal && dElectrons > 0 && dElectrons < 10;

  if (isTransitionMetal) {
    stabilityOut.textContent = colourPossible
      ? "Partially filled d orbitals allow electron transitions (absorbing visible light), so colour is possible."
      : "This ion has an empty or filled d subshell, which is often more stable and often colourless.";
  } else {
    const outer = outerShellInfo(shellArr);
    stabilityOut.textContent = outer.full
      ? "✅ Full outer shell pattern (noble gas-like stability idea)."
      : "Try adjusting electrons to reach a full outer shell (e.g. 2, 8 or 2, 8, 8).";
  }

  renderOrbitals(config);

  if (orbitalBadge) {
    if (colourPossible) {
      orbitalBadge.innerHTML =
        '<span class="badge badge--tm">Transition metal — partially filled d orbitals (colour possible)</span>';
    } else if (isTransitionMetal) {
      orbitalBadge.innerHTML =
        '<span class="badge">Transition metal — filled or empty d subshell (often colourless)</span>';
    } else {
      orbitalBadge.innerHTML = "";
    }
  }

  if (energyBands) energyBands.style.display = colourPossible ? "block" : "none";
  if (jumpWrap) jumpWrap.style.display = colourPossible ? "block" : "none";

  if (colourPossible) {
    const singles = Array.from(document.querySelectorAll('.orb-box[data-orb="3d"][data-fill="single"]'));
    const empties = Array.from(document.querySelectorAll('.orb-box[data-orb="3d"][data-fill="empty"]'));
    let fromEl = null, toEl = null;

    if (singles.length && empties.length) {
      fromEl = singles[0];
      toEl = empties[0];
    } else if (singles.length >= 2) {
      fromEl = singles[0];
      toEl = singles[1];
    }

    if (fromEl && toEl) playPromotionAnimationBetween(fromEl, toEl);
  }
}

// ===== Events =====
elSelect.addEventListener("change", () => {
  Z = parseInt(elSelect.value, 10);
  setElectrons(Z); // reset to neutral atom
  updateIonTargets();
  setResult("—", null);
  announce(`Element changed to ${getElement().name}.`);
});

btnMinus.addEventListener("click", () => setElectrons(electrons - 1));
btnPlus.addEventListener("click", () => setElectrons(electrons + 1));

slider.addEventListener("input", (e) => setElectrons(parseInt(e.target.value, 10)));

btnSetTarget.addEventListener("click", () => {
  const desiredCharge = parseInt(targetIon.value, 10);
  setElectrons(Z - desiredCharge);
  setResult("—", null);
  announce(`Set electrons to match target charge ${fmtCharge(desiredCharge)}.`);
});

btnRandom.addEventListener("click", () => {
  const sym = getElement().sym;
  const ions = commonIons[sym] || [];
  if (!ions.length) { alert("No preset common ions for this element. Try a different element."); return; }

  const desired = ions[Math.floor(Math.random() * ions.length)];
  targetIon.value = String(desired);

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
