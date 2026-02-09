const elements = [
  {Z:1,sym:"H"},{Z:2,sym:"He"},{Z:3,sym:"Li"},
  {Z:4,sym:"Be"},{Z:5,sym:"B"},{Z:6,sym:"C"},
  {Z:7,sym:"N"},{Z:8,sym:"O"},{Z:9,sym:"F"},
  {Z:10,sym:"Ne"},{Z:11,sym:"Na"},{Z:12,sym:"Mg"},
  {Z:13,sym:"Al"},{Z:14,sym:"Si"},{Z:15,sym:"P"},
  {Z:16,sym:"S"},{Z:17,sym:"Cl"},{Z:18,sym:"Ar"},
  {Z:19,sym:"K"},{Z:20,sym:"Ca"},
  {Z:21,sym:"Sc"},{Z:22,sym:"Ti"},{Z:23,sym:"V"},
  {Z:24,sym:"Cr"},{Z:25,sym:"Mn"},{Z:26,sym:"Fe"},
  {Z:27,sym:"Co"},{Z:28,sym:"Ni"},{Z:29,sym:"Cu"},
  {Z:30,sym:"Zn"},{Z:31,sym:"Ga"},{Z:32,sym:"Ge"},
  {Z:33,sym:"As"},{Z:34,sym:"Se"},{Z:35,sym:"Br"},
  {Z:36,sym:"Kr"}
];

const filling = [
  ["1s",2],["2s",2],["2p",6],
  ["3s",2],["3p",6],
  ["4s",2],["3d",10],["4p",6]
];

let Z = 12;
let electrons = 12;

const elSelect = document.getElementById("elementSelect");
const zOut = document.getElementById("zOut");
const chargeOut = document.getElementById("chargeOut");
const eCount = document.getElementById("eCount");
const spdf = document.getElementById("spdf");
const shellsDiv = document.getElementById("shells");

elements.forEach(e=>{
  const opt=document.createElement("option");
  opt.value=e.Z;
  opt.textContent=`${e.sym} (Z=${e.Z})`;
  if(e.Z===12) opt.selected=true;
  elSelect.appendChild(opt);
});

elSelect.addEventListener("change",()=>{
  Z=parseInt(elSelect.value);
  electrons=Z;
  render();
});

document.getElementById("minus").onclick=()=>{
  electrons=Math.max(1,electrons-1);
  render();
};

document.getElementById("plus").onclick=()=>{
  electrons=Math.min(36,electrons+1);
  render();
};

document.getElementById("slider").oninput=(e)=>{
  electrons=parseInt(e.target.value);
  render();
};

function buildConfig(e){
  let remain=e;
  let result=[];
  for(let [orb,cap] of filling){
    if(remain<=0) break;
    let take=Math.min(cap,remain);
    result.push([orb,take]);
    remain-=take;
  }
  return result;
}

function render(){
  zOut.textContent=Z;
  eCount.textContent=electrons;

  const charge=Z-electrons;
  chargeOut.textContent=charge>0?`+${charge}`:charge;

  const config=buildConfig(electrons);

  spdf.textContent=config.map(c=>`${c[0]}${c[1]}`).join(" ");

  shellsDiv.innerHTML="";
  let shells={};

  config.forEach(c=>{
    let n=c[0][0];
    shells[n]=(shells[n]||0)+c[1];
  });

  Object.keys(shells).forEach(n=>{
    let div=document.createElement("div");
    div.className="shell";
    div.textContent=`Shell ${n}: ${shells[n]} e⁻`;
    shellsDiv.appendChild(div);
  });
}

render();
