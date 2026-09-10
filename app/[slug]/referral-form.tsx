"use client";
import { FormEvent, useState } from "react";
import PrizeWheel from "./prize-wheel";

type Business = { id:string; name:string; message_template:string; offer_text:string|null };
type Prize = { id:string; name:string; color:string };

export default function ReferralForm({ business, prizes }: { business:Business; prizes:Prize[] }) {
  const [name,setName]=useState(""); const [phone,setPhone]=useState("");
  const [referrerId,setReferrerId]=useState<string|null>(null); const [code,setCode]=useState<string|null>(null);
  const [shares,setShares]=useState(0); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  const [friendPhones,setFriendPhones]=useState(["",""]); const [sentSlots,setSentSlots]=useState([false,false]); const [sendingSlot,setSendingSlot]=useState<number|null>(null);

  async function start(event:FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response=await fetch("/api/referrers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({businessId:business.id,name,phone})});
    const result=await response.json(); setLoading(false);
    if(!response.ok){ setError(result.error??"Something went wrong. Please try again."); return; }
    setReferrerId(result.id); setCode(result.referralCode);
  }

  async function share(slot:number) {
    if(!code||!referrerId)return;
    setSendingSlot(slot); setError("");
    const contactResponse=await fetch("/api/referral-contacts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({referrerId,slot:slot+1,phone:friendPhones[slot]})});
    const contact=await contactResponse.json();
    if(!contactResponse.ok){setSendingSlot(null);setError(contact.error??"Enter a valid friend’s number.");return;}
    const referralUrl=`${window.location.origin}/r/${code}`;
    const text=`${business.message_template} ${referralUrl}`;
    try {
      const response=await fetch("/api/share",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({referrerId,contactId:contact.id})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error);
      setShares(Math.min(result.shareAttempts,2)); setSentSlots(current=>current.map((sent,index)=>index===slot?true:sent)); setSendingSlot(null);
      const separator=/iPhone|iPad|iPod/i.test(navigator.userAgent)?"&":"?";
      window.location.href=`sms:${contact.phone}${separator}body=${encodeURIComponent(text)}`;
    } catch {
      setSendingSlot(null);
      setError("The share window could not open. Please try again.");
    }
  }

  if(code)return <div className="form">
    <div><h2>{shares>=2?"You did it!":"Text two friends"}</h2><p>Enter a different mobile number for each friend. We will prepare the message for you.</p></div>
    {shares<2&&<PrizeWheel prizes={prizes} locked/>}
    <div className="steps" aria-label={`${shares} of 2 shares started`}>{[0,1].map(step=><span className={`step ${step<shares?"done":""}`} key={step}/>)}</div>
    {shares<2?<div className="referral-slots">{[0,1].map(slot=><div className={`referral-slot ${sentSlots[slot]?"complete":""}`} key={slot}>
      <label className="field"><span>Friend {slot+1} mobile number</span><input disabled={sentSlots[slot]} required type="tel" value={friendPhones[slot]} onChange={event=>setFriendPhones(current=>current.map((value,index)=>index===slot?event.target.value:value))} placeholder="(555) 555-5555"/></label>
      <button className="button secondary" disabled={sentSlots[slot]||sendingSlot!==null||!friendPhones[slot]} onClick={()=>share(slot)}>{sentSlots[slot]?"Text prepared":sendingSlot===slot?"Preparing…":`Text friend ${slot+1}`}</button>
    </div>)}</div>:<PrizeWheel referrerId={referrerId!} prizes={prizes}/>} 
    <p className="fine-print">Friend numbers are stored only to verify this referral. They remain unconsented contacts and will not be called or messaged by Authoric unless they personally opt in.</p>
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
