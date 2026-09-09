"use client";

import { FormEvent, useState } from "react";

export default function LeadCaptureForm({businessId,businessName,referrerId}:{businessId:string;businessName:string;referrerId:string}) {
  const [name,setName]=useState(""); const [phone,setPhone]=useState(""); const [email,setEmail]=useState("");
  const [consent,setConsent]=useState(false); const [loading,setLoading]=useState(false); const [complete,setComplete]=useState(false); const [error,setError]=useState("");

  async function submit(event:FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response=await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({businessId,referrerId,name,phone,email,consent})});
    const result=await response.json(); setLoading(false);
    if(!response.ok){setError(result.error??"We could not save your request.");return;}
    setComplete(true);
  }

  if(complete)return <div className="reward"><strong>Offer claimed!</strong><br/>{businessName} can now follow up with you about your offer.</div>;

  return <form className="form lead-form" onSubmit={submit}>
    <div><h2>Claim your offer</h2><p>Enter your phone number or email and {businessName} will follow up.</p></div>
    <label className="field"><span>Your name</span><input required value={name} onChange={event=>setName(event.target.value)} placeholder="Your name"/></label>
    <label className="field"><span>Phone number</span><input type="tel" value={phone} onChange={event=>setPhone(event.target.value)} placeholder="(555) 555-5555"/></label>
    <div className="or"><span>or</span></div>
    <label className="field"><span>Email address</span><input type="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="you@example.com"/></label>
    <label className="consent"><input required type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)}/><span>I agree to be contacted by {businessName} about this offer by phone, email, or text. Consent is not a condition of purchase. Message and data rates may apply.</span></label>
    <button className="button secondary" disabled={loading} type="submit">{loading?"Claiming your offer…":"Claim my offer"}</button>
    {error&&<div className="error">{error}</div>}
  </form>;
}
