"use client";

import { ScrollReveal } from "../components/landing/ScrollReveal";
import { AnimatedCounter } from "../components/landing/AnimatedCounter";
import { StickyNav } from "../components/landing/StickyNav";
import { PhoneMockup } from "../components/landing/PhoneMockup";
import { ModuleShowcase } from "../components/landing/ModuleShowcase";

/* ─── Play Store icon (reused) ─── */
function PlayStoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5Z" fill="white" />
      <path d="M16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12Z" fill="white" opacity="0.8" />
      <path d="M20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81Z" fill="white" opacity="0.6" />
      <path d="M6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" fill="white" opacity="0.9" />
    </svg>
  );
}

/* ─── Testimonial card ─── */
function TestimonialCard({
  name,
  role,
  text,
  initial,
  color,
}: {
  name: string;
  role: string;
  text: string;
  initial: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] feature-card">
      <p className="text-[14px] leading-[1.7] text-[#64748B] mb-4">
        &ldquo;{text}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        >
          {initial}
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#1E293B]">{name}</p>
          <p className="text-[11px] text-[#94A3B8]">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#1E293B]">
      {/* Skip to content */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:bg-[#156064] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
      >
        Langsung ke konten
      </a>

      {/* Sticky nav (appears on scroll) */}
      <StickyNav />

      {/* ═══ Masthead ═══ */}
      <header className="bg-[#2C7695]">
        <div className="max-w-[960px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="hero-reveal">
            <img src="/logos/apick-logo-white.svg" alt="apick" className="h-7 opacity-80" />
          </div>
          <a
            href="https://play.google.com/store/apps/details?id=id.apick.app"
            className="text-white/70 text-[13px] font-medium hover:text-white transition-colors"
          >
            Download
          </a>
        </div>
      </header>

      {/* ═══ Hero — Logo-centric ═══ */}
      <section id="content" className="bg-[#2C7695] text-white pb-20 pt-10 md:pt-16 overflow-hidden relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 logo-shimmer-bg pointer-events-none" aria-hidden="true" />

        <div className="max-w-[960px] mx-auto px-6 relative">
          {/* Centered logo hero */}
          <div className="flex flex-col items-center text-center">
            {/* Big logo — the star of the show */}
            <div className="logo-entrance logo-glow mb-8">
              <img
                src="/logos/apick-logo-white.svg"
                alt="apick — Life, well arranged"
                className="h-20 md:h-28"
              />
            </div>

            <p className="text-[13px] font-semibold tracking-[0.2em] uppercase text-white/40 mb-5 hero-reveal">
              Satu app, empat solusi
            </p>
            <h1 className="text-[36px] leading-[1.1] md:text-[56px] md:leading-[1.08] font-extrabold tracking-tight max-w-[600px] hero-reveal-2">
              Semua tercatat rapi, hidup jadi tenang.
            </h1>
            <p className="mt-6 text-[17px] md:text-[19px] leading-[1.6] text-white/50 max-w-[480px] hero-reveal-3">
              Pedagang kaki lima. Ibu kos. Bendahara RT. Calon pengantin.
              Satu app simpel yang bantu ngatur semuanya.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 hero-reveal-4">
              <a
                href="https://play.google.com/store/apps/details?id=id.apick.app"
                className="pulse-glow inline-flex items-center gap-2.5 bg-[#156064] text-white px-7 py-3.5 rounded-xl text-[15px] font-bold hover:bg-[#0E4A4D] transition-colors"
              >
                <PlayStoreIcon />
                Download Gratis
              </a>
              <a
                href="#modules-heading"
                className="text-white/40 text-[14px] hover:text-white/70 transition-colors py-3.5"
              >
                Baca dulu &#8595;
              </a>
            </div>
          </div>

          {/* Module pills + Phone mockup row */}
          <div className="mt-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            {/* Module pills */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 hero-reveal-4">
              {[
                { id: "lapak", name: "Lapak", color: "#50BFC3" },
                { id: "sewa", name: "Sewa", color: "#00C49A" },
                { id: "warga", name: "Warga", color: "#FB8F67" },
                { id: "hajat", name: "Hajat", color: "#D95877" },
              ].map((m) => (
                <a
                  key={m.id}
                  href="#modules-heading"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 bg-white/10 text-white/80 hover:bg-white/20 hover:scale-105"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: m.color }}
                    aria-hidden="true"
                  />
                  {m.name}
                </a>
              ))}
            </div>

            {/* Phone mockup */}
            <div className="hidden md:flex justify-center hero-reveal-4">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Logo Showcase — Full Color & White ═══ */}
      <section className="py-16 md:py-24 border-b border-[#E2E8F0]" aria-labelledby="brand-heading">
        <div className="max-w-[960px] mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-[13px] font-semibold tracking-[0.2em] uppercase text-[#94A3B8] mb-4">
                Brand Kami
              </p>
              <h2
                id="brand-heading"
                className="text-[28px] md:text-[36px] font-extrabold leading-[1.1] text-[#1E293B] mb-3"
              >
                apick
              </h2>
              <p className="text-[15px] text-[#64748B] editorial-serif">
                Life, well arranged.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full color logo on light background */}
            <ScrollReveal delay={1}>
              <div className="logo-card bg-white rounded-2xl border border-[#E2E8F0] p-10 md:p-14 flex flex-col items-center justify-center min-h-[240px]">
                <img
                  src="/logos/apick-logo-full.svg"
                  alt="apick logo — full color"
                  className="h-14 md:h-20 mb-6"
                />
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src="/logos/apick-app-icon.svg"
                    alt=""
                    className="w-10 h-10 rounded-xl shadow-md"
                    aria-hidden="true"
                  />
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-[#1E293B]">apick</p>
                    <p className="text-[11px] text-[#94A3B8]">Life, well arranged.</p>
                  </div>
                </div>
                <p className="text-[12px] text-[#94A3B8] mt-2 tracking-wide uppercase font-medium">
                  Full Color
                </p>
              </div>
            </ScrollReveal>

            {/* White logo on dark background */}
            <ScrollReveal delay={2}>
              <div className="logo-card bg-[#2C7695] rounded-2xl p-10 md:p-14 flex flex-col items-center justify-center min-h-[240px] relative overflow-hidden">
                <div className="absolute inset-0 logo-shimmer-bg pointer-events-none" aria-hidden="true" />
                <div className="relative">
                  <img
                    src="/logos/apick-logo-white.svg"
                    alt="apick logo — white"
                    className="h-14 md:h-20 mb-6 logo-glow"
                  />
                  <div className="flex items-center gap-3 mb-3 justify-center">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center" aria-hidden="true">
                      <img
                        src="/logos/apick-app-icon.svg"
                        alt=""
                        className="w-8 h-8 rounded-lg brightness-0 invert"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-bold text-white">apick</p>
                      <p className="text-[11px] text-white/50">Life, well arranged.</p>
                    </div>
                  </div>
                  <p className="text-[12px] text-white/40 mt-2 tracking-wide uppercase font-medium text-center">
                    White
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Module color strip */}
          <ScrollReveal delay={3}>
            <div className="mt-8 flex items-center justify-center gap-3">
              {[
                { name: "Lapak", color: "#50BFC3" },
                { name: "Sewa", color: "#00C49A" },
                { name: "Warga", color: "#FB8F67" },
                { name: "Hajat", color: "#D95877" },
              ].map((m) => (
                <div key={m.name} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: m.color }}
                    aria-hidden="true"
                  />
                  <span className="text-[12px] font-semibold" style={{ color: m.color }}>
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Pull quote ═══ */}
      <section className="border-b border-[#E2E8F0] py-14 md:py-20">
        <div className="max-w-[960px] mx-auto px-6 text-center">
          <ScrollReveal>
            <p className="editorial-serif text-[22px] md:text-[28px] leading-[1.5] text-[#64748B] max-w-[640px] mx-auto">
              &ldquo;Kalau bisa buka WhatsApp, bisa pakai apick.&rdquo;
            </p>
            <p className="mt-4 text-[13px] font-semibold tracking-[0.15em] uppercase text-[#94A3B8]">
              Prinsip desain kami
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Interactive Module Showcase (tabbed) ═══ */}
      <ModuleShowcase />

      {/* ═══ How it works ═══ */}
      <section className="border-t border-[#E2E8F0] py-16 md:py-20 bg-[#F8FAFC]">
        <div className="max-w-[960px] mx-auto px-6">
          <ScrollReveal>
            <p className="text-[13px] font-semibold tracking-[0.2em] uppercase text-[#156064] mb-4">
              Mulai
            </p>
            <h2 className="text-[32px] md:text-[40px] font-extrabold leading-[1.1] text-[#1E293B] mb-12">
              2 menit, langsung pakai.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                num: "1",
                title: "Download & Login",
                desc: "Login pakai Google atau nomor HP. Itu aja.",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <rect x="10" y="4" width="12" height="24" rx="3" stroke="#2C7695" strokeWidth="2" fill="#E5F8F3" />
                    <circle cx="16" cy="24" r="1.5" fill="#2C7695" />
                    <path d="M14 12L16 14L18 10" stroke="#50BFC3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                num: "2",
                title: "Pilih Modul",
                desc: "Lapak? Kos-kosan? RT? Hajatan? Aktifin yang kamu butuh.",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <rect x="4" y="4" width="10" height="10" rx="2" fill="#50BFC3" opacity="0.3" stroke="#50BFC3" strokeWidth="1.5" />
                    <rect x="18" y="4" width="10" height="10" rx="2" fill="#00C49A" opacity="0.3" stroke="#00C49A" strokeWidth="1.5" />
                    <rect x="4" y="18" width="10" height="10" rx="2" fill="#FB8F67" opacity="0.3" stroke="#FB8F67" strokeWidth="1.5" />
                    <rect x="18" y="18" width="10" height="10" rx="2" fill="#D95877" opacity="0.3" stroke="#D95877" strokeWidth="1.5" />
                  </svg>
                ),
              },
              {
                num: "3",
                title: "Langsung Jalan",
                desc: "Ikuti panduan pertama, data langsung bisa diisi. Paket Gratis, tanpa batas waktu.",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <circle cx="16" cy="16" r="11" stroke="#156064" strokeWidth="2" fill="#E6F3F4" />
                    <path d="M12 16L15 19L21 13" stroke="#156064" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
            ].map((s, i) => (
              <ScrollReveal key={s.num} delay={i + 1}>
                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] feature-card h-full">
                  <div className="flex items-center gap-3 mb-4">
                    {s.icon}
                    <span className="text-[36px] font-extrabold text-[#E2E8F0] leading-none" aria-hidden="true">
                      {s.num}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-bold text-[#1E293B]">
                    {s.title}
                  </h3>
                  <p className="text-[14px] leading-[1.65] text-[#64748B] mt-2">
                    {s.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="border-t border-[#E2E8F0] py-16 md:py-20" aria-labelledby="testimonials">
        <div className="max-w-[960px] mx-auto px-6">
          <ScrollReveal>
            <p className="text-[13px] font-semibold tracking-[0.2em] uppercase text-[#94A3B8] mb-4">
              Cerita pengguna
            </p>
            <h2
              id="testimonials"
              className="text-[28px] md:text-[36px] font-extrabold leading-[1.1] text-[#1E293B] mb-10"
            >
              Mereka udah pakai, kamu kapan?
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScrollReveal delay={1}>
              <TestimonialCard
                name="Pak Hadi"
                role="Penjual Soto, Semarang"
                text="Dulu catat di buku, sering lupa. Sekarang tinggal tap, semua keliatan. Istri seneng karena bisa cek omzet dari rumah."
                initial="H"
                color="#50BFC3"
              />
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <TestimonialCard
                name="Bu Ani"
                role="Pemilik Kos, Malang"
                text="12 kamar, 1 app. Anak kos bayar, langsung keliatan. Ga perlu WA satu-satu nagih. Kamar kosong langsung share."
                initial="A"
                color="#00C49A"
              />
            </ScrollReveal>
            <ScrollReveal delay={3}>
              <TestimonialCard
                name="Mas Faisal"
                role="Ketua RT, Bekasi"
                text="Warga bisa cek sendiri udah bayar apa belum. Laporan keuangan tinggal share link. Transparan, ga ada fitnah."
                initial="F"
                color="#FB8F67"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ Three pillars ═══ */}
      <section className="bg-[#F8FAFC] border-t border-[#E2E8F0] py-16 md:py-20" aria-labelledby="why-apick">
        <div className="max-w-[960px] mx-auto px-6">
          <ScrollReveal>
            <p
              id="why-apick"
              className="text-[13px] font-semibold tracking-[0.2em] uppercase text-[#94A3B8] mb-4"
            >
              Kenapa apick
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-8">
            {[
              {
                title: "Gampang banget",
                desc: "1 layar, 1 tugas. Bahasa manusia, bukan bahasa komputer. Tombol gede, tulisan jelas. Dibuat untuk semua umur.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <circle cx="14" cy="14" r="12" stroke="#156064" strokeWidth="2" fill="#E6F3F4" />
                    <path d="M10 14.5L13 17.5L19 11" stroke="#156064" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                title: "Nyambung real-time",
                desc: "Kamu catat, pelanggan langsung lihat. Warga bayar, bendahara langsung tau. Tanpa telepon, tanpa tunggu.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <circle cx="14" cy="14" r="12" stroke="#00C49A" strokeWidth="2" fill="#E5F8F3" />
                    <path d="M9 14H19M14 9V19" stroke="#00C49A" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                title: "Bisa via browser",
                desc: "Setiap data bisa di-share via link. Pelanggan, penyewa, warga cukup klik link di WhatsApp. Ga perlu install.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <circle cx="14" cy="14" r="12" stroke="#FB8F67" strokeWidth="2" fill="#FFF0EB" />
                    <path d="M11 14C11 12.3 12.3 11 14 11H17C18.7 11 20 12.3 20 14C20 15.7 18.7 17 17 17H14" stroke="#FB8F67" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M17 14C17 15.7 15.7 17 14 17H11C9.3 17 8 15.7 8 14C8 12.3 9.3 11 11 11H14" stroke="#FB8F67" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
              },
            ].map((p, i) => (
              <ScrollReveal key={p.title} delay={i + 1}>
                <div className="feature-card bg-white rounded-2xl p-6 border border-[#E2E8F0] h-full">
                  <div className="mb-4">{p.icon}</div>
                  <h3 className="text-[17px] font-bold text-[#1E293B] mb-2">
                    {p.title}
                  </h3>
                  <p className="text-[14px] leading-[1.7] text-[#64748B]">
                    {p.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Stats band ═══ */}
      <section className="border-t border-[#E2E8F0] py-14" aria-label="Statistik">
        <div className="max-w-[960px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedCounter value="4" label="Modul tersedia" />
            <AnimatedCounter value="Rp 0" label="Mulai tanpa bayar" />
            <AnimatedCounter value="< 2 mnt" label="Langsung pakai" />
            <AnimatedCounter value="24/7" label="Data tersimpan aman" />
          </div>
        </div>
      </section>

      {/* ═══ Pricing ═══ */}
      <section className="border-t border-[#E2E8F0] py-16 md:py-24 bg-[#F8FAFC]" aria-labelledby="pricing-heading">
        <div className="max-w-[960px] mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-[13px] font-semibold tracking-[0.2em] uppercase text-[#156064] mb-4">
                Harga
              </p>
              <h2
                id="pricing-heading"
                className="text-[28px] md:text-[40px] font-extrabold leading-[1.1] text-[#1E293B] mb-4"
              >
                Coba dulu, gratis.
              </h2>
              <p className="text-[16px] leading-[1.6] text-[#64748B] max-w-[520px] mx-auto">
                Paket Gratis sudah lengkap buat mulai. Kalau usaha makin berkembang, upgrade kapan aja sesuai kebutuhan.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Gratis */}
            <ScrollReveal delay={1}>
              <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] p-6 h-full flex flex-col feature-card">
                <div className="mb-5">
                  <h3 className="text-[18px] font-extrabold text-[#1E293B]">Gratis</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-[36px] font-extrabold text-[#1E293B]">Rp 0</span>
                    <span className="text-[14px] text-[#94A3B8]">selamanya</span>
                  </div>
                  <p className="mt-3 text-[14px] leading-[1.6] text-[#64748B]">
                    Cocok buat yang baru mulai atau usaha kecil. Semua fitur dasar, tanpa batas waktu.
                  </p>
                </div>
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#94A3B8] mb-2">Yang kamu dapat:</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {[
                    "1 modul aktif (pilih salah satu)",
                    "30 anggota / pelanggan",
                    "5 unit properti (kamar/kontrakan)",
                    "20 produk jualan",
                    "1 acara hajatan",
                    "100 tamu undangan",
                    "Catat transaksi & iuran",
                    "Share data via link WhatsApp",
                    "Portal web untuk pelanggan",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] text-[#64748B]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
                        <circle cx="8" cy="8" r="7" stroke="#50BFC3" strokeWidth="1.5" />
                        <path d="M5 8L7 10L11 6" stroke="#50BFC3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#94A3B8] mb-2">Belum termasuk:</p>
                <ul className="space-y-1.5 mb-6">
                  {[
                    "AI scan nota",
                    "Export laporan PDF",
                    "Analisa & statistik",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] text-[#CBD5E1]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
                        <circle cx="8" cy="8" r="7" stroke="#CBD5E1" strokeWidth="1.5" />
                        <path d="M5 8H11" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://play.google.com/store/apps/details?id=id.apick.app"
                  className="block text-center bg-[#F1F5F9] text-[#1E293B] px-5 py-3 rounded-xl text-[14px] font-bold hover:bg-[#E2E8F0] transition-colors"
                >
                  Mulai Gratis
                </a>
              </div>
            </ScrollReveal>

            {/* Starter */}
            <ScrollReveal delay={2}>
              <div className="bg-white rounded-2xl border-2 border-[#156064] p-6 h-full flex flex-col relative feature-card shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#156064] text-white text-[11px] font-bold px-3 py-1 rounded-full">
                    Paling Populer
                  </span>
                </div>
                <div className="mb-5">
                  <h3 className="text-[18px] font-extrabold text-[#1E293B]">Starter</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-[36px] font-extrabold text-[#156064]">Rp 29rb</span>
                    <span className="text-[14px] text-[#94A3B8]">/bulan</span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#50BFC3] font-semibold">
                    Atau Rp 290rb/tahun (hemat 2 bulan)
                  </p>
                  <p className="mt-3 text-[14px] leading-[1.6] text-[#64748B]">
                    Usaha mulai berkembang. Tambah 1 modul lagi, pakai AI buat scan nota, dan export laporan ke PDF.
                  </p>
                </div>
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#156064] mb-2">Semua di Gratis, plus:</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {[
                    "2 modul aktif (kombinasi bebas)",
                    "100 anggota / pelanggan",
                    "20 unit properti",
                    "100 produk jualan",
                    "3 acara hajatan",
                    "500 tamu undangan",
                    "Scan nota otomatis pakai AI",
                    "Export laporan keuangan ke PDF",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] text-[#1E293B] font-medium">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
                        <circle cx="8" cy="8" r="7" fill="#156064" />
                        <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://play.google.com/store/apps/details?id=id.apick.app"
                  className="block text-center bg-[#156064] text-white px-5 py-3 rounded-xl text-[14px] font-bold hover:bg-[#0E4A4D] transition-colors"
                >
                  Coba Starter
                </a>
              </div>
            </ScrollReveal>

            {/* Pro */}
            <ScrollReveal delay={3}>
              <div className="bg-[#2C7695] rounded-2xl border-2 border-[#2C7695] p-6 h-full flex flex-col feature-card">
                <div className="mb-5">
                  <h3 className="text-[18px] font-extrabold text-white">Pro</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-[36px] font-extrabold text-white">Rp 79rb</span>
                    <span className="text-[14px] text-white/50">/bulan</span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#50BFC3] font-semibold">
                    Atau Rp 790rb/tahun (hemat 2 bulan)
                  </p>
                  <p className="mt-3 text-[14px] leading-[1.6] text-white/60">
                    Buat yang serius kelola banyak hal. Semua modul, semua fitur, tanpa batasan jumlah.
                  </p>
                </div>
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-white/40 mb-2">Semua di Starter, plus:</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {[
                    "Semua 4 modul aktif sekaligus",
                    "Anggota & pelanggan tanpa batas",
                    "Unit properti tanpa batas",
                    "Produk jualan tanpa batas",
                    "Acara hajatan tanpa batas",
                    "Tamu undangan tanpa batas",
                    "Analisa & statistik lengkap",
                    "Prioritas fitur baru",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] text-white/80">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
                        <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.5" opacity="0.5" />
                        <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://play.google.com/store/apps/details?id=id.apick.app"
                  className="block text-center bg-white text-[#2C7695] px-5 py-3 rounded-xl text-[14px] font-bold hover:bg-white/90 transition-colors"
                >
                  Pilih Pro
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Comparison table */}
          <ScrollReveal>
            <div className="mt-12 overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#E2E8F0]">
                    <th className="text-left py-3 pr-4 text-[#64748B] font-semibold w-[40%]">Fitur</th>
                    <th className="text-center py-3 px-2 text-[#1E293B] font-bold">Gratis</th>
                    <th className="text-center py-3 px-2 text-[#156064] font-bold">Starter</th>
                    <th className="text-center py-3 px-2 text-[#2C7695] font-bold">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Modul aktif", free: "1", starter: "2", pro: "4 (semua)" },
                    { feature: "Anggota / pelanggan", free: "30", starter: "100", pro: "Tanpa batas" },
                    { feature: "Unit properti", free: "5", starter: "20", pro: "Tanpa batas" },
                    { feature: "Produk jualan", free: "20", starter: "100", pro: "Tanpa batas" },
                    { feature: "Acara hajatan", free: "1", starter: "3", pro: "Tanpa batas" },
                    { feature: "Tamu undangan", free: "100", starter: "500", pro: "Tanpa batas" },
                    { feature: "Catat transaksi & iuran", free: "✓", starter: "✓", pro: "✓" },
                    { feature: "Share via WhatsApp", free: "✓", starter: "✓", pro: "✓" },
                    { feature: "Portal web pelanggan", free: "✓", starter: "✓", pro: "✓" },
                    { feature: "AI scan nota", free: "—", starter: "✓", pro: "✓" },
                    { feature: "Export PDF", free: "—", starter: "✓", pro: "✓" },
                    { feature: "Analisa & statistik", free: "—", starter: "—", pro: "✓" },
                  ].map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}>
                      <td className="py-2.5 pr-4 text-[#1E293B] font-medium">{row.feature}</td>
                      <td className="py-2.5 px-2 text-center text-[#64748B]">{row.free}</td>
                      <td className="py-2.5 px-2 text-center text-[#1E293B] font-medium">{row.starter}</td>
                      <td className="py-2.5 px-2 text-center text-[#1E293B] font-bold">{row.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>

          {/* Reassurance */}
          <ScrollReveal>
            <div className="mt-10 text-center">
              <p className="text-[14px] text-[#64748B] leading-[1.6] max-w-[520px] mx-auto">
                Ga perlu langsung bayar. Mulai dari Gratis, rasakan sendiri manfaatnya. Upgrade kapan aja kalau memang butuh — bisa bulanan atau tahunan (hemat 2 bulan).
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="bg-[#2C7695] py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 logo-shimmer-bg pointer-events-none" aria-hidden="true" />
        <div className="max-w-[960px] mx-auto px-6 text-center relative">
          <ScrollReveal>
            <img
              src="/logos/apick-logo-white.svg"
              alt=""
              className="h-16 md:h-24 mx-auto mb-8 logo-glow"
              aria-hidden="true"
            />
            <h2 className="text-[32px] md:text-[44px] font-extrabold text-white leading-[1.1] max-w-[480px] mx-auto">
              Mulai dari yang gratis dulu.
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-white/50 max-w-[400px] mx-auto">
              Paket Gratis sudah cukup buat mulai. Nanti kalau butuh lebih, tinggal upgrade kapan aja.
            </p>
            <a
              href="https://play.google.com/store/apps/details?id=id.apick.app"
              className="mt-8 pulse-glow inline-flex items-center gap-2.5 bg-[#156064] text-white px-7 py-3.5 rounded-xl text-[15px] font-bold hover:bg-[#0E4A4D] transition-colors"
            >
              <PlayStoreIcon />
              Download apick
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-[#1E5A6F] text-white/40 py-12">
        <div className="max-w-[960px] mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img src="/logos/apick-logo-white.svg" alt="apick" className="h-9" />
            <div className="w-px h-6 bg-white/15" aria-hidden="true" />
            <span className="text-[13px] editorial-serif text-white/35">Life, well arranged.</span>
          </div>
          <nav aria-label="Navigasi">
            <div className="flex items-center gap-5 text-[13px]">
              {["lapak", "sewa", "warga", "hajat"].map((id) => (
                <a
                  key={id}
                  href="#modules-heading"
                  className="hover:text-white/70 transition-colors capitalize"
                >
                  {id}
                </a>
              ))}
              <a
                href="#pricing-heading"
                className="hover:text-white/70 transition-colors"
              >
                Harga
              </a>
            </div>
          </nav>
        </div>
        <div className="max-w-[960px] mx-auto px-6 mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-[12px] text-white/25">
            &copy; 2026 apick. Dibuat di Indonesia.
          </p>
          <a
            href="/privacy"
            className="text-[12px] text-white/25 hover:text-white/50 transition-colors"
          >
            Kebijakan Privasi
          </a>
        </div>
      </footer>
    </main>
  );
}
