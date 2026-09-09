import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import ReferralForm from "./referral-form";
export const dynamic = "force-dynamic";

export default async function BusinessPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const { data: business } = await getSupabaseAdmin().from("businesses").select("id,name,message_template,offer_text").eq("slug", slug).single();
  if (!business) notFound();
  return (
    <main className="shell"><section className="card intro-card">
      <span className="eyebrow">A thank-you from {business.name}</span>
      <h1>Share something good.</h1>
      <p>Tell five friends about your experience and unlock your customer reward.</p>
      <ReferralForm business={business} />
    </section></main>
  );
}
