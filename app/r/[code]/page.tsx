import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
export const dynamic="force-dynamic";

export default async function ReferralLandingPage({params}:PageProps<"/r/[code]">) {
  const {code}=await params; const supabase=getSupabaseAdmin();
  const {data:referrer}=await supabase.from("referrers").select("id,name,businesses(name,offer_text)").eq("referral_code",code).single();
  if(!referrer)notFound();
  await supabase.from("referral_events").insert({referrer_id:referrer.id,event_type:"link_clicked"});
  const value=referrer.businesses as unknown;
  const business=(Array.isArray(value)?value[0]:value) as {name:string;offer_text:string|null}|null;
  return <main className="shell"><section className="card intro-card">
    <span className="eyebrow">You were referred by {referrer.name}</span><h1>Meet {business?.name??"a local business"}.</h1>
    <div className="offer"><strong>Your offer</strong><p>{business?.offer_text??"Contact us to claim your referral offer."}</p></div>
    <p>Show this page when you contact the business. Lead capture and booking are coming in the next version.</p>
  </section></main>;
}
