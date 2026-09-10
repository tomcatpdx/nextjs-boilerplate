import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request:Request) {
  try {
    const {businessId,referrerId,name,phone,email,consent}=await request.json();
    if(!businessId||!referrerId||!name?.trim())return Response.json({error:"Please enter your name."},{status:400});
    if(!phone?.trim()&&!email?.trim())return Response.json({error:"Please enter a phone number or email."},{status:400});
    if(!consent)return Response.json({error:"Please agree to be contacted about the offer."},{status:400});
    const supabase=getSupabaseAdmin();
    const {error}=await supabase.from("leads").insert({business_id:businessId,referrer_id:referrerId,name:name.trim(),phone:phone?.trim()||null,email:email?.trim().toLowerCase()||null,marketing_consent:true});
    if(error)throw error;
    await supabase.from("referral_events").insert({referrer_id:referrerId,event_type:"lead_submitted"});
    return Response.json({success:true});
  } catch { return Response.json({error:"We could not save your request."},{status:500}); }
}
