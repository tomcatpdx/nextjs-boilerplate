"use client";
import { FormEvent, useState } from "react";
import PrizeWheel from "./prize-wheel";

type Business = { id:string; name:string; message_template:string; offer_text:string|null };
type Prize = { id:string; name:string; color:string };

export default function ReferralForm({ business, prizes }: { business:Business; prizes:Prize[] }) {
  const [name,setName]=useState(""); const [phone,setPhone]=useState("");
  const [referrerId,setReferrerId]=useState<string|null>(null); const [code,setCode]=useState<string|null>(null);
  const [shares,setShares]=useState(0); const [loading,setLoading]=useState(false); const [error,setError]=useState("");

  async function start(event:FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response=await fetch("/api/referrers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({businessId:business.id,name,phone})});
    const result=await response.json(); setLoading(false);
    if(!response.ok){ setError(result.error??"Something went wrong. Please try again."); return; }
    setReferrerId(result.id); setCode(result.referralCode);
  }

  async function share() {
    if(!code||!referrerId)return;
    const referralUrl=`${window.location.origin}/r/${code}`;
    const text=`${business.message_template} ${referralUrl}`;
    try {
      if(navigator.share) await navigator.share({title:business.name,text});
      else window.location.href=`sms:?&body=${encodeURIComponent(text)}`;
      const response=await fetch("/api/share",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({referrerId})});
      const result=await response.json(); if(response.ok)setShares(Math.min(result.shareAttempts,2));
    } catch (shareError) {
      if(shareError instanceof DOMException&&shareError.name==="AbortError")return;
      setError("The share window could not open. Please try again.");
    }
  }

  if(code)return <div className="form">
    <div><h2>{shares>=2?"You did it!":`Share ${2-shares} more time${2-shares===1?"":"s"}`}</h2><p>Choose a different friend each time from your phone&apos;s share menu.</p></div>
    {shares<2&&<PrizeWheel prizes={prizes} locked/>}
    <div className="steps" aria-label={`${shares} of 2 shares started`}>{[0,1].map(step=><span className={`step ${step<shares?"done":""}`} key={step}/>)}</div>
    {shares<2?<button className="button secondary" onClick={share}>Text a friend</button>:<PrizeWheel referrerId={referrerId!} prizes={prizes}/>} 
    <p className="fine-print">The button opens your phone&apos;s share menu. Messages are sent by you, not automatically by the business.</p>
    {error&&<div className="error">{error}</div>}
  </div>;

  return <div className="prelaunch">
    <PrizeWheel prizes={prizes} locked/>
    <form className="form" onSubmit={start}>
      <label className="field"><span>Your name</span><input required value={name} onChange={event=>setName(event.target.value)} placeholder="Thomas"/></label>
      <label className="field"><span>Mobile number</span><input required type="tel" value={phone} onChange={event=>setPhone(event.target.value)} placeholder="(555) 555-5555"/></label>
      <button className="button" disabled={loading} type="submit">{loading?"Creating your link…":"Get my referral link"}</button>
      {error&&<div className="error">{error}</div>}
    </form>
  </div>;
}
