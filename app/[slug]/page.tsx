import { notFound } from "next/navigation";
import Image from "next/image";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import ReferralForm from "./referral-form";
export const dynamic = "force-dynamic";

export default async function BusinessPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();
  const { data: business } = await supabase.from("businesses").select("id,name,message_template,offer_text").eq("slug", slug).single();
  if (!business) notFound();
  const { data: prizes } = await supabase.from("wheel_prizes").select("id,name,color").eq("business_id", business.id).eq("active", true).order("created_at", { ascending: true });
  return (
    <main className="shell"><section className="card intro-card">
      <Image className="brand-logo" src="/authoric-logo.png" alt="Authoric" width={143} height={160} priority />
      <span className="eyebrow">A thank-you from {business.name}</span>
      <h1>Share something good.</h1>
      <p>Tell two friends about your experience and unlock your customer reward.</p>
      <ReferralForm business={business} prizes={prizes ?? []} />
    </section></main>
  );
}
