import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
export async function POST(request:Request) {
  try {
    const {businessId,name,phone}=await request.json();
    if(!businessId||!name?.trim()||!phone?.trim())return Response.json({error:"Name and mobile number are required."},{status:400});
    const referralCode=randomUUID().replaceAll("-","").slice(0,10);
    const {data,error}=await getSupabaseAdmin().from("referrers").insert({business_id:businessId,name:name.trim(),phone:phone.trim(),referral_code:referralCode}).select("id,referral_code").single();
    if(error)throw error;
    return Response.json({id:data.id,referralCode:data.referral_code});
  } catch { return Response.json({error:"We could not create your referral link."},{status:500}); }
}
