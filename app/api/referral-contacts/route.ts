import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function normalizePhone(value:string) {
  const digits=value.replace(/\D/g,"");
  if(digits.length===10)return `1${digits}`;
  return digits;
}

export async function POST(request:Request) {
  try {
    const {referrerId,slot,phone}=await request.json();
    const normalized=normalizePhone(phone??"");
    if(!referrerId||![1,2].includes(slot)||normalized.length<11||normalized.length>15)return Response.json({error:"Enter a valid mobile number."},{status:400});
    const supabase=getSupabaseAdmin();
    const {data:referrer}=await supabase.from("referrers").select("phone").eq("id",referrerId).single();
    if(!referrer)return Response.json({error:"Referral not found."},{status:404});
    if(normalizePhone(referrer.phone??"")===normalized)return Response.json({error:"Use a friend’s number, not your own."},{status:400});
    const phoneHash=createHash("sha256").update(normalized).digest("hex");
    const {data,error}=await supabase.from("referral_contacts").upsert({referrer_id:referrerId,slot,phone:normalized,phone_hash:phoneHash,consent_status:"unconsented"},{onConflict:"referrer_id,slot"}).select("id,phone").single();
    if(error?.code==="23505")return Response.json({error:"Use a different number for each friend."},{status:409});
    if(error)throw error;
    return Response.json(data);
  } catch {return Response.json({error:"The referral contact could not be saved."},{status:500});}
}
