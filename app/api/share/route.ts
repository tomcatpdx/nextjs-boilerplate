import { getSupabaseAdmin } from "@/lib/supabase-admin";
export async function POST(request:Request) {
  try {
    const {referrerId,contactId}=await request.json();
    if(!referrerId||!contactId)return Response.json({error:"Missing referral contact."},{status:400});
    const supabase=getSupabaseAdmin();
    const {data:contact,error:contactError}=await supabase.from("referral_contacts").update({share_opened_at:new Date().toISOString()}).eq("id",contactId).eq("referrer_id",referrerId).select("id").single();
    if(contactError||!contact)throw contactError;
    const {count,error:countError}=await supabase.from("referral_contacts").select("id",{count:"exact",head:true}).eq("referrer_id",referrerId).not("share_opened_at","is",null);
    if(countError)throw countError;
    const shareAttempts=Math.min(count??0,2);
    const {error:updateError}=await supabase.from("referrers").update({share_attempts:shareAttempts}).eq("id",referrerId);
    if(updateError)throw updateError;
    await supabase.from("referral_events").insert({referrer_id:referrerId,event_type:"share_opened"});
    return Response.json({shareAttempts});
  } catch { return Response.json({error:"The share could not be recorded."},{status:500}); }
}
