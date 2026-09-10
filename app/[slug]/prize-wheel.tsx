"use client";

import { useMemo, useState } from "react";

type Prize = { id:string; name:string; color:string };
type SpinResult = { prizeId:string; prizeName:string; redemptionCode:string; expiresAt:string };

function shortName(name:string) {
  return name.replace("Free ", "").replace("website credit", "credit").replace("digital marketing", "marketing");
}

export default function PrizeWheel({referrerId,prizes,locked=false}:{referrerId?:string;prizes:Prize[];locked?:boolean}) {
  const [rotation,setRotation]=useState(0); const [spinning,setSpinning]=useState(false);
  const [result,setResult]=useState<SpinResult|null>(null); const [showResult,setShowResult]=useState(false); const [error,setError]=useState("");
  const segment=360/Math.max(prizes.length,1);
  const background=useMemo(()=>`conic-gradient(${prizes.map((prize,index)=>`${prize.color} ${index*segment}deg ${(index+1)*segment}deg`).join(",")})`,[prizes,segment]);

  async function spin() {
    if(locked||spinning||result||!prizes.length||!referrerId)return;
    setSpinning(true); setError("");
    const response=await fetch("/api/spin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({referrerId})});
    const data=await response.json();
    if(!response.ok){setSpinning(false);setError(data.error??"The wheel could not spin.");return;}
    const index=Math.max(0,prizes.findIndex(prize=>prize.id===data.prizeId));
    const center=(index+.5)*segment;
    setResult(data); setRotation(360*7+(360-center));
    window.setTimeout(()=>{setSpinning(false);setShowResult(true);},5000);
  }

  if(showResult&&result)return <div className="winner-card">
    <span className="winner-kicker">You won</span><h2>{result.prizeName}</h2>
    <p>Your redemption code</p><strong className="redemption-code">{result.redemptionCode}</strong>
    <p className="fine-print">Expires {new Date(result.expiresAt).toLocaleDateString()}. Save this screen to claim your prize.</p>
  </div>;

  return <div className={`wheel-stage ${locked?"wheel-stage-locked":""}`}>
    <div className="wheel-unlocked"><span>{locked?"Your reward is waiting":"Prize wheel unlocked"}</span><p>{locked?"Share with two friends to unlock one spin.":"One spin. Every section wins."}</p></div>
    <div className="wheel-wrap">
      <div className="wheel-pointer" aria-hidden="true"/>
      <div className="wheel" style={{background,transform:`rotate(${rotation}deg)`}}>
        {prizes.map((prize,index)=>{
          const angle=(index+.5)*segment-90; const radians=angle*Math.PI/180; const radius=94;
          return <span className="wheel-label" key={prize.id} style={{left:`calc(50% + ${Math.cos(radians)*radius}px)`,top:`calc(50% + ${Math.sin(radians)*radius}px)`,transform:`translate(-50%,-50%) rotate(${angle+90}deg)`}}>{shortName(prize.name)}</span>;
        })}
        <div className="wheel-hub">A</div>
      </div>
      {locked&&<div className="wheel-lock"><span>Locked</span><strong>2 shares to unlock</strong></div>}
    </div>
    {locked?<div className="prize-preview"><span>Possible prizes</span><div>{prizes.map(prize=><small key={prize.id}>{prize.name}</small>)}</div></div>:<button className="button wheel-button" disabled={spinning||!prizes.length} onClick={spin}>{spinning?"Spinning…":"Spin the wheel"}</button>}
    {error&&<div className="error">{error}</div>}
  </div>;
}
