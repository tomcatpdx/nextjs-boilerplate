import Image from "next/image";

export default function Home() {
  return (
    <main className="shell">
      <section className="card intro-card">
        <Image className="brand-logo" src="/authoric-logo.png" alt="Authoric" width={143} height={160} priority />
        <span className="eyebrow">Authoric Referrals</span>
        <h1>Turn happy customers into your next customers.</h1>
        <p>Each business gets a tap-ready referral page, trackable links, and a simple reward experience.</p>
      </section>
    </main>
  );
}
