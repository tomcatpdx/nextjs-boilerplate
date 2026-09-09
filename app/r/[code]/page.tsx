import { notFound } from "next/navigation";
import Image from "next/image";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import LeadCaptureForm from "./lead-capture-form";
export const dynamic="force-dynamic";

export default async function ReferralLandingPage({params}:PageProps<"/r/[code]">) {
  const {code}=await params; const supabase=getSupabaseAdmin();
  const {data:referrer}=await supabase.from("referrers").select("id,name,businesses(id,name,offer_text)").eq("referral_code",code).single();
  if(!referrer)notFound();
  await supabase.from("referral_events").insert({referrer_id:referrer.id,event_type:"link_clicked"});
  const value=referrer.businesses as unknown;
  const business=(Array.isArray(value)?value[0]:value) as {id:string;name:string;offer_text:string|null}|null;
  return <main className="shell"><section className="card intro-card">
    <Image className="brand-logo" src="/authoric-logo.png" alt="Authoric" width={143} height={160} priority />
    <span className="eyebrow">You were referred by {referrer.name}</span><h1>Meet {business?.name??"a local business"}.</h1>
    <div className="offer"><strong>Your offer</strong><p>{business?.offer_text??"Contact us to claim your referral offer."}</p></div>
    {business&&<LeadCaptureForm businessId={business.id} businessName={business.name} referrerId={referrer.id}/>} 
  </section></main>;
}
