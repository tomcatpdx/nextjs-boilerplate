import { randomBytes, randomInt } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type Prize = { id:string; name:string; weight:number; color:string; quantity_available:number|null };

function prizeFromRelation(value:unknown) {
  return (Array.isArray(value)?value[0]:value) as {id:string;name:string}|null;
}

export async function POST(request:Request) {
  try {
    const {referrerId}=await request.json();
    if(!referrerId)return Response.json({error:"Missing referral."},{status:400});
    const supabase=getSupabaseAdmin();
    const {data:referrer}=await supabase.from("referrers").select("id,business_id,share_attempts").eq("id",referrerId).single();
    if(!referrer)return Response.json({error:"Referral not found."},{status:404});
    if((referrer.share_attempts??0)<2)return Response.json({error:"Complete two shares to unlock the wheel."},{status:403});

    const {data:existing}=await supabase.from("wheel_spins").select("redemption_code,expires_at,wheel_prizes(id,name)").eq("referrer_id",referrerId).maybeSingle();
    if(existing){const prize=prizeFromRelation(existing.wheel_prizes);return Response.json({prizeId:prize?.id,prizeName:prize?.name,redemptionCode:existing.redemption_code,expiresAt:existing.expires_at});}

    const {data:prizeRows}=await supabase.from("wheel_prizes").select("id,name,weight,color,quantity_available").eq("business_id",referrer.business_id).eq("active",true).order("created_at",{ascending:true});
    const prizes=((prizeRows??[]) as Prize[]).filter(prize=>prize.quantity_available===null||prize.quantity_available>0);
    if(!prizes.length)return Response.json({error:"No prizes are currently available."},{status:409});
    const total=prizes.reduce((sum,prize)=>sum+prize.weight,0); let draw=randomInt(total);
    const winner=prizes.find(prize=>{draw-=prize.weight;return draw<0;})??prizes[0];
    const redemptionCode=`AUTH-${randomBytes(4).toString("hex").toUpperCase()}`;
    const expiresAt=new Date(Date.now()+30*24*60*60*1000).toISOString();
    const {error}=await supabase.from("wheel_spins").insert({referrer_id:referrerId,prize_id:winner.id,redemption_code:redemptionCode,expires_at:expiresAt});
    if(error)throw error;
    await supabase.from("referral_events").insert({referrer_id:referrerId,event_type:"wheel_spun"});
    return Response.json({prizeId:winner.id,prizeName:winner.name,redemptionCode,expiresAt});
  } catch {return Response.json({error:"The wheel could not spin. Please try again."},{status:500});}
}
