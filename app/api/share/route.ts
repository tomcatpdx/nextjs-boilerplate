import { getSupabaseAdmin } from "@/lib/supabase-admin";
export async function POST(request:Request) {
  try {
    const {referrerId}=await request.json();
    if(!referrerId)return Response.json({error:"Missing referral."},{status:400});
    const supabase=getSupabaseAdmin();
    const {data:referrer,error:readError}=await supabase.from("referrers").select("share_attempts").eq("id",referrerId).single();
    if(readError||!referrer)throw readError;
    const shareAttempts=Math.min((referrer.share_attempts??0)+1,5);
    const {error:updateError}=await supabase.from("referrers").update({share_attempts:shareAttempts}).eq("id",referrerId);
    if(updateError)throw updateError;
    await supabase.from("referral_events").insert({referrer_id:referrerId,event_type:"share_opened"});
    return Response.json({shareAttempts});
  } catch { return Response.json({error:"The share could not be recorded."},{status:500}); }
}
