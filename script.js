/* Ion Builder (H–Kr)
   - High contrast toggle button
   - Dyslexia spacing ON by default (HTML attribute)
   - Colour labels ON throughout (no toggle)
*/

const elements = [
  {Z:1,  sym:"H",  name:"Hydrogen"},
  {Z:2,  sym:"He", name:"Helium"},
  {Z:3,  sym:"Li", name:"Lithium"},
  {Z:4,  sym:"Be", name:"Beryllium"},
  {Z:5,  sym:"B",  name:"Boron"},
  {Z:6,  sym:"C",  name:"Carbon"},
  {Z:7,  sym:"N",  name:"Nitrogen"},
  {Z:8,  sym:"O",  name:"Oxygen"},
  {Z:9,  sym:"F",  name:"Fluorine"},
  {Z:10, sym:"Ne", name:"Neon"},
  {Z:11, sym:"Na", name:"Sodium"},
  {Z:12, sym:"Mg", name:"Magnesium"},
  {Z:13, sym:"Al", name:"Aluminium"},
  {Z:14, sym:"Si", name:"Silicon"},
  {Z:15, sym:"P",  name:"Phosphorus"},
  {Z:16, sym:"S",  name:"Sulfur"},
  {Z:17, sym:"Cl", name:"Chlorine"},
  {Z:18, sym:"Ar", name:"Argon"},
  {Z:19, sym:"K",  name:"Potassium"},
  {Z:20, sym:"Ca", name:"Calcium"},
  {Z:21, sym:"Sc", name:"Scandium"},
  {Z:22, sym:"Ti", name:"Titanium"},
  {Z:23, sym:"V",  name:"Vanadium"},
  {Z:24, sym:"Cr", name:"Chromium"},
  {Z:25, sym:"Mn", name:"Manganese"},
  {Z:26, sym:"Fe", name:"Iron"},
  {Z:27, sym:"Co", name:"Cobalt"},
  {Z:28, sym:"Ni", name:"Nickel"},
  {Z:29, sym:"Cu", name:"Copper"},
  {Z:30, sym:"Zn", name:"Zinc"},
  {Z:31, sym:"Ga", name:"Gallium"},
  {Z:32, sym:"Ge", name:"Germanium"},
  {Z:33, sym:"As", name:"Arsenic"},
  {Z:34, sym:"Se", name:"Selenium"},
  {Z:35, sym:"Br", name:"Bromine"},
  {Z:36, sym:"Kr", name:"Krypton"}
];

const commonIons = {
  H:[+1,-1],
  Li:[+1], Be:[+2], B:[+3], C:[-4,+4],
  N:[-3], O:[-2], F:[-1],
  Na:[+1], Mg:[+2], Al:[+3],
  Si:[-4,+4], P:[-3,+3,+5], S:[-2,+4,+6],
  Cl:[-1,+1,+3,+5,+7], K:[+1], Ca:[+2],
  Sc:[+3], Ti:[+2,+3,+4], V:[+2,+3,+4,+5],
  Cr:[+2,+3,+6], Mn:[+2,+4,+7], Fe:[+2,+3],
  Co:[+2,+3], Ni:[+2], Cu:[+1,+2], Zn:[+2],
  Ga:[+3], Ge:[+2,+4], As:[-3,+3,+5],
  Se:[-2,+4,+6], Br:[-1,+1,+3,+5,+7]
};

// Filling order for first 36 electrons
const fillingOrder = [
  { label: "1s", n:1, sub:"s", cap:2 },
  { label: "2s", n:2, sub:"s", cap:2 },
  { label: "2p", n:2, sub:"p", cap:6 },
  { label: "3s", n:3, sub:"s", cap:2 },
  { label: "3p", n:3, sub:"p", cap:6 },
  { label: "4s", n:4, sub:"s", cap:2 },
  { label: "3d", n:3, sub:"d", cap:10 },
  { label: "4p", n:4, sub:"p", cap:6 }
];

// DOM
const elSelect = document.getElementById("elementSelect");
const targetIon = document.getElementById("targetIon");

const zOut = document.getElementById("zOut");
const symOut = document.getElementById("symOut");
const chargeOut = document.getElementById("chargeOut");
const eCountEl = document.getElementById("eCount");
const spdfEl = document.getElementById("spdf");
const shellsEl = document.getElementById("shells");
const orbitalViewEl = document.getElementById("orbitalView");
const stabilityEl = document.getElementById("stability");
const sliderEl = document.getElementById("slider");
const resultOut = document.getElementById("resultOut");
const srStatus = document.getElementById("srStatus");

// High contrast button
const toggleContrast = document.getElementById("toggleContrast");

let Z = 12;
let electrons = 12;

// Populate element dropdown
for (const e of elements){
  const opt = document.createElement("option");
  opt.value = String(e.Z);
  opt.textContent = `${e.sym} — ${e.name} (Z=${e.Z})`;
  if (e.Z === 12) opt.selected = true;
  elSelect.appendChild(opt);
}

// Events
elSelect.addEventListener("change", () => {
  Z = parseInt(elSelect.value, 10);
  setElectrons(Z);
  updateIonTargets();
  setResult("—");
  announce(`Element changed to ${getElement().name}. Electrons set to neutral atom.`);
});

document.getElementById("minus").addEventListener("click", () => setElectrons(electrons - 1));
document.getElementById("plus").addEventListener("click", () => setElectrons(electrons + 1));
sliderEl.addEventListener("input", (e) => setElectrons(parseInt(e.target.value, 10)));

document.getElementById("setTarget").addEventListener("click", () => {
  const desiredCharge = parseInt(targetIon.value, 10);
  const targetE = Z - desiredCharge;
  setElectrons(targetE);
  setResult("—");
  announce(`Set electrons to match target charge ${fmtCharge(desiredCharge)}.`);
});

document.getElementById("randomChallenge").addEventListener("click", () => {
  const sym = getElement().sym;
  const ions = commonIons[sym] || [];
  if (!ions.length){
    alert("No preset common ions for this element. Try a different element.");
    return;
  }
  const rnd = ions[Math.floor(Math.random() * ions.length)];
  targetIon.value = String(rnd);

  const targetE = Z - rnd;
  const nudge = (Math.random() < 0.5 ? 1 : -1);
  setElectrons(clamp(targetE + nudge, 1, 36));
  setResult("—");
  announce(`Random challenge: build charge ${fmtCharge(rnd)}.`);
});

document.getElementById("check").addEventListener("click", () => {
  const desiredCharge = parseInt(targetIon.value, 10);
  const currentCharge = Z - electrons;
  if (currentCharge === desiredCharge){
    setResult("Correct ✅", true);
    announce("Correct ion built.");
  } else {
    setResult(`Not yet — you made ${fmtCharge(currentCharge)}`, false);
    announce(`Not yet. Current charge is ${fmtCharge(currentCharge)}.`);
  }
});

// High contrast toggle
toggleContrast.addEventListener("click", () => {
  const root = document.documentElement;
  const isHigh = root.getAttribute("data-contrast") === "high";
  root.setAttribute("data-contrast", isHigh ? "normal" : "high");
  toggleContrast.setAttribute("aria-pressed", String(!isHigh));
  announce(isHigh ? "High contrast off." : "High contrast on.");
});

// Helpers
function getElement(){
  return elements.find(x => x.Z === Z) || elements[0];
}
function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
function fmtCharge(ch){
  if (ch === 0) return "0";
  return ch > 0 ? `+${ch}` : `${ch}`;
}
function toSup(num){
  const map = { "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹" };
  return String(num).split("").map(d => map[d] || d).join("");
}
function setResult(text, good=null){
  resultOut.textContent = text;
  resultOut.style.color = good === null ? "" : (good ? "var(--good)" : "var(--bad)");
  resultOut.style.fontWeight = "900";
}
function announce(msg){ srStatus.textContent = msg; }

// Core electron config
function setElectrons(val){
  electrons = clamp(val, 1, 36);
  sliderEl.value = String(electrons);
  render();
}

function buildConfig(e){
  let remaining = e;
  const filled = [];
  for (const sub of fillingOrder){
    if (remaining <= 0) break;
    const take = Math.min(sub.cap, remaining);
    filled.push({ ...sub, e: take });
    remaining -= take;
  }
  return filled;
}

function spdfString(config){
  return config.map(s => `${s.label}${toSup(s.e)}`).join(" ");
}

function shellsFromConfig(config){
  const shells = {};
  for (const sub of config){
    shells[sub.n] = (shells[sub.n] || 0) + sub.e;
  }
  const arr = [];
  for (let n=1; n<=4; n++){
    const cap = (n===1?2 : n===2?8 : n===3?18 : 32);
    arr.push({ n, e: shells[n] || 0, cap });
  }
  return arr;
}

function outerShellInfo(shellArr){
  const highest = [...shellArr].reverse().find(s => s.e > 0);
  if (!highest) return { n:1, e:0, full:false };
  const full = (highest.n === 1 && highest.e === 2) || (highest.n >= 2 && highest.e === 8);
  return { n: highest.n, e: highest.e, full };
}

// Hund simplified orbital boxes
function orbitalBoxes(subLabel, eCount){
  const type = subLabel.slice(-1);
  const boxes = (type === "s" ? 1 : type === "p" ? 3 : type === "d" ? 5 : 7);

  let remaining = eCount;
  const boxStates = Array.from({length: boxes}, () => []);
  for (let i=0; i<boxes && remaining>0; i++){ boxStates[i].push("↑"); remaining--; }
  for (let i=0; i<boxes && remaining>0; i++){ boxStates[i].push("↓"); remaining--; }
  return boxStates.map(st => st.join("")).map(s => s || " ");
}

function renderShells(shellArr){
  shellsEl.innerHTML = "";
  for (const s of shellArr){
    if (s.e === 0 && s.n === 4) continue;

    const shell = document.createElement("div");
    shell.className = "shell";
    shell.innerHTML = `
      <div class="shell__k">Shell n=${s.n}</div>
      <div class="shell__v mono">${s.e} e⁻</div>
      <div class="ring" aria-hidden="true">
        <div class="fill" style="width:${Math.min(100, (s.e / s.cap) * 100)}%"></div>
      </div>
    `;
    shellsEl.appendChild(shell);
  }
}

function renderOrbitals(config){
  orbitalViewEl.innerHTML = "";

  for (const sub of config){
    const card = document.createElement("div");
    card.className = "subshell";

    const boxes = orbitalBoxes(sub.label, sub.e);
    const badge = `
      <span class="badge" data-sub="${sub.sub}">
        <span class="badge__dot" aria-hidden="true"></span>
        ${sub.label}${toSup(sub.e)} (${sub.sub}-block)
      </span>
    `;

    const boxesHTML = boxes.map(b => {
      const label = sub.sub.toUpperCase(); // always on
      return `<div class="obox" data-sub="${sub.sub}" aria-label="${sub.label} orbital box">${b} ${label}</div>`;
    }).join("");

    card.innerHTML = `
      <div class="subshell__head">
        <div><b>${sub.label}</b> subshell</div>
        ${badge}
      </div>
      <div class="boxes">${boxesHTML}</div>
    `;

    orbitalViewEl.appendChild(card);
  }
}

function updateIonTargets(){
  const sym = getElement().sym;
  const ions = commonIons[sym] || [];
  targetIon.innerHTML = "";

  const list = ions.length ? ions : [0];
  for (const ch of list){
    const opt = document.createElement("option");
    opt.value = String(ch);
    opt.textContent = fmtCharge(ch);
    targetIon.appendChild(opt);
  }
}

function render(){
  const el = getElement();
  zOut.textContent = String(Z);
  symOut.textContent = el.sym;

  eCountEl.textContent = String(electrons);

  const charge = Z - electrons;
  chargeOut.textContent = fmtCharge(charge);

  const config = buildConfig(electrons);
  spdfEl.textContent = spdfString(config);

  const shellArr = shellsFromConfig(config);
  renderShells(shellArr);

  const outer = outerShellInfo(shellArr);
  stabilityEl.textContent = outer.full
    ? "✅ Full outer shell pattern (noble gas-like stability idea)."
    : "Try adjusting electrons to reach a full outer shell (e.g., 2, 8 or 2, 8, 8).";

  renderOrbitals(config);
}

// init
updateIonTargets();
render();
