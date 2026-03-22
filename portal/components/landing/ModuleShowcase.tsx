"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollReveal } from "./ScrollReveal";

/* ─── SVG Icons (inline for zero-dependency) ─── */

function IconLapak({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="8" y="20" width="48" height="6" rx="3" fill="#50BFC3" />
      <path d="M8 26 Q14 32 20 26 Q26 32 32 26 Q38 32 44 26 Q50 32 56 26" fill="#50BFC3" stroke="#3DA8AC" strokeWidth="1.5" />
      <rect x="12" y="30" width="40" height="22" rx="2" fill="#D4F1F2" stroke="#50BFC3" strokeWidth="1.5" />
      <rect x="26" y="38" width="12" height="14" rx="1" fill="#50BFC3" />
      <circle cx="35" cy="46" r="1.5" fill="#3DA8AC" />
      <rect x="16" y="34" width="8" height="8" rx="1" fill="#E8F7F8" stroke="#50BFC3" strokeWidth="1" />
      <line x1="20" y1="34" x2="20" y2="42" stroke="#50BFC3" strokeWidth="0.8" />
      <line x1="16" y1="38" x2="24" y2="38" stroke="#50BFC3" strokeWidth="0.8" />
    </svg>
  );
}

function IconSewa({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M10 28 L32 10 L54 28" fill="#C2F0E5" stroke="#00C49A" strokeWidth="2" strokeLinejoin="round" />
      <rect x="14" y="28" width="36" height="24" rx="2" fill="#E5F8F3" stroke="#00C49A" strokeWidth="1.5" />
      <circle cx="32" cy="37" r="5" fill="#00C49A" />
      <circle cx="32" cy="37" r="2.5" fill="#E5F8F3" />
      <rect x="31" y="42" width="2" height="7" rx="1" fill="#00C49A" />
      <rect x="18" y="32" width="6" height="6" rx="1" fill="#A8E8D6" stroke="#00C49A" strokeWidth="0.8" />
      <rect x="40" y="32" width="6" height="6" rx="1" fill="#A8E8D6" stroke="#00C49A" strokeWidth="0.8" />
    </svg>
  );
}

function IconWarga({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="20" r="7" fill="#FB8F67" />
      <path d="M20 44 Q20 33 32 33 Q44 33 44 44" fill="#FCC7B3" stroke="#FB8F67" strokeWidth="1.5" />
      <circle cx="16" cy="24" r="5" fill="#FCAB8D" />
      <path d="M8 42 Q8 34 16 34 Q22 34 23 38" fill="#FDD5C5" stroke="#FB8F67" strokeWidth="1" />
      <circle cx="48" cy="24" r="5" fill="#FCAB8D" />
      <path d="M56 42 Q56 34 48 34 Q42 34 41 38" fill="#FDD5C5" stroke="#FB8F67" strokeWidth="1" />
      <circle cx="44" cy="44" r="6" fill="#FB8F67" />
      <path d="M41 44 L43.5 46.5 L47 41.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHajat({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="8" y="18" width="48" height="32" rx="4" fill="#F9DDE5" stroke="#D95877" strokeWidth="1.5" />
      <path d="M8 22 L32 38 L56 22" fill="#F4C1CE" stroke="#D95877" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M27 28 Q27 24 31 24 Q33 24 33 27 Q33 24 35 24 Q39 24 39 28 Q39 33 33 37 Q27 33 27 28Z" fill="#D95877" />
      <circle cx="18" cy="14" r="1.5" fill="#EDA0B5" />
      <circle cx="48" cy="12" r="2" fill="#F4C1CE" />
      <path d="M14 10 L15 8 L16 10 L18 11 L16 12 L15 14 L14 12 L12 11Z" fill="#D95877" />
    </svg>
  );
}

/* ─── Module Data ─── */

const modules = [
  {
    id: "lapak",
    name: "apick lapak",
    tabLabel: "Lapak",
    color: "#50BFC3",
    colorLight: "#D4F1F2",
    colorMuted: "#E8F7F8",
    icon: IconLapak,
    headline: "Catat dagangan, fokus jualan.",
    persona: "Pak Edi",
    personaRole: "Pedagang Nasi Goreng",
    storyLead: "Tiap malam jualan. Tiap pagi lupa berapa omzet kemarin.",
    storyBody: "Nota kertas hilang kena minyak. Istri nanya \"untung berapa bulan ini?\", bingung jawabnya.",
    solutionLead: "Sekarang tap 1 tombol tiap kali ada yang beli.",
    solutionBody: "Malam selesai jualan, langsung keliatan: omzet hari ini, untung bersih, trend mingguan.",
    features: [
      { title: "1-Tap Catat Jualan", desc: "Ketuk produk, otomatis tercatat." },
      { title: "4 Mode Usaha", desc: "Pedagang, laundry, guru/pelatih, jasa antrian." },
      { title: "Untung Rugi Otomatis", desc: "Catat pengeluaran, apick hitung profit." },
      { title: "Scan Nota AI", desc: "Foto struk, AI baca dan masukkan otomatis." },
      { title: "Database Pelanggan", desc: "Data pelanggan terkumpul otomatis." },
      { title: "Web Katalog", desc: "Link yang bisa dishare ke pelanggan." },
    ],
  },
  {
    id: "sewa",
    name: "apick sewa",
    tabLabel: "Sewa",
    color: "#00C49A",
    colorLight: "#C2F0E5",
    colorMuted: "#E5F8F3",
    icon: IconSewa,
    headline: "Kelola properti, tanpa ribet.",
    persona: "Bu Ratna",
    personaRole: "Pemilik 12 Kamar Kos",
    storyLead: "Tiap bulan pusing ngingetin anak kos bayar.",
    storyBody: "Ada yang telat 3 bulan. Kamar kosong belum diiklanin. Catatannya? Buku tulis kumel.",
    solutionLead: "Semua status kamar, 1 layar.",
    solutionBody: "Siapa yang udah bayar, siapa nunggak, maintenance belum dikerjain. Reminder otomatis.",
    features: [
      { title: "Dashboard Properti", desc: "Kamar terisi, kosong, total pemasukan." },
      { title: "Tagihan Otomatis", desc: "Set jatuh tempo sekali, apick generate tiap bulan." },
      { title: "Laporan Maintenance", desc: "Penghuni lapor kerusakan dari app." },
      { title: "Kontrak Digital", desc: "Template kontrak, simpan di vault digital." },
      { title: "Rental Barang", desc: "Track stok rental dan biaya otomatis." },
      { title: "Share Kamar Kosong", desc: "1 tap share info kamar ke WhatsApp." },
    ],
  },
  {
    id: "warga",
    name: "apick warga",
    tabLabel: "Warga",
    color: "#FB8F67",
    colorLight: "#FDE8DF",
    colorMuted: "#FFF0EB",
    icon: IconWarga,
    headline: "Iuran transparan, warga tenang.",
    persona: "Pak Bambang",
    personaRole: "Bendahara RT, 3 Tahun",
    storyLead: "Tiap bulan nagih iuran door-to-door. Dicatat di buku.",
    storyBody: "Akhir tahun diminta laporan, harus ngitung ulang dari Januari. Capek.",
    solutionLead: "Semua iuran tercatat digital. Laporan? Share link.",
    solutionBody: "Warga cek status bayar sendiri. Laporan keuangan transparan, ga ada yang curiga.",
    features: [
      { title: "Organisasi Fleksibel", desc: "RT/RW, pengajian, mesjid, arisan, komunitas." },
      { title: "Catat Iuran 1 Tap", desc: "Checklist siapa yang bayar, reminder ke WA." },
      { title: "Laporan Publik", desc: "Link laporan bisa dibagikan ke semua warga." },
      { title: "Mode Mesjid", desc: "Infaq harian, fundraising, laporan publik." },
      { title: "Pengumuman", desc: "Buat pengumuman, track siapa yang baca." },
      { title: "Jadwal Piket", desc: "Atur jadwal ronda, piket, tukar jadwal." },
    ],
  },
  {
    id: "hajat",
    name: "apick hajat",
    tabLabel: "Hajat",
    color: "#D95877",
    colorLight: "#F9DDE5",
    colorMuted: "#FCEDF1",
    icon: IconHajat,
    headline: "Undang tamu, tanpa drama.",
    persona: "Mbak Dina",
    personaRole: "Calon Pengantin",
    storyLead: "Undangan digital di platform lain, Rp 150.000 cuma buat 1 template.",
    storyBody: "Input tamu satu-satu, ga bisa tracking siapa yang konfirmasi. Ribet.",
    solutionLead: "Bikin undangan gratis. Teks dibuatin AI.",
    solutionBody: "Share ke WhatsApp per orang. Tamu RSVP dari link, tanpa install app.",
    features: [
      { title: "7 Jenis Acara", desc: "Nikahan, khitanan, aqiqah, syukuran, dll." },
      { title: "AI Bikin Undangan", desc: "Ketik nama acara, AI buatkan teks sopan." },
      { title: "RSVP Tracking", desc: "Tamu konfirmasi dari browser, masuk dashboard." },
      { title: "Check-in Hari H", desc: "Checklist tamu yang datang." },
      { title: "Amplop Tracker", desc: "Catat amplop saat acara, total real-time." },
      { title: "Saran Amplop", desc: "Saran nominal wajar berdasarkan jenis acara." },
    ],
  },
];

/* ─── Feature Card with hover effect ─── */

function FeatureCard({
  title,
  desc,
  color,
  index,
}: {
  title: string;
  desc: string;
  color: string;
  index: number;
}) {
  return (
    <ScrollReveal delay={index + 1}>
      <div className="feature-card bg-white rounded-xl p-4 border border-[#E2E8F0] cursor-default">
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-white text-[12px] font-bold"
            style={{ backgroundColor: color }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-[#1E293B]">{title}</h4>
            <p className="text-[13px] leading-[1.6] text-[#64748B] mt-0.5">
              {desc}
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

/* ─── Main Module Showcase ─── */

export function ModuleShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const [showFeatures, setShowFeatures] = useState(false);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const mod = modules[activeTab];
  const Icon = mod.icon;

  const closeDialog = useCallback(() => {
    setShowFeatures(false);
    toggleBtnRef.current?.focus();
  }, []);

  // Listen for module switch from StickyNav
  useEffect(() => {
    function handleSwitch(e: Event) {
      const moduleId = (e as CustomEvent).detail;
      const idx = modules.findIndex((m) => m.id === moduleId);
      if (idx !== -1) setActiveTab(idx);
    }
    window.addEventListener("apick:switch-module", handleSwitch);
    return () => window.removeEventListener("apick:switch-module", handleSwitch);
  }, []);

  // Focus trap + Escape for modal
  useEffect(() => {
    if (!showFeatures) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const closeBtn = dialog.querySelector<HTMLButtonElement>("[data-close-btn]");
    closeBtn?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDialog();
        return;
      }
      if (e.key === "Tab" && dialog) {
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showFeatures, closeDialog]);

  return (
    <section className="py-16 md:py-24" aria-labelledby="modules-heading">
      <div className="max-w-[960px] mx-auto px-6">
        <ScrollReveal>
          <p className="text-[13px] font-semibold tracking-[0.2em] uppercase text-[#156064] mb-4">
            Empat Modul
          </p>
          <h2
            id="modules-heading"
            className="text-[32px] md:text-[40px] font-extrabold leading-[1.1] text-[#1E293B] mb-10"
          >
            Pilih yang kamu butuh.
          </h2>
        </ScrollReveal>

        {/* Tab buttons */}
        <div
          ref={tabContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-none"
          role="tablist"
          aria-label="Modul apick"
        >
          {modules.map((m, i) => {
            const TabIcon = m.icon;
            return (
              <button
                key={m.id}
                role="tab"
                aria-selected={i === activeTab}
                aria-controls={`panel-${m.id}`}
                onClick={() => setActiveTab(i)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-semibold transition-all duration-300 whitespace-nowrap shrink-0"
                style={{
                  backgroundColor: i === activeTab ? m.colorMuted : "transparent",
                  color: i === activeTab ? m.color : "#94A3B8",
                  borderWidth: 2,
                  borderColor: i === activeTab ? m.color : "#E2E8F0",
                }}
              >
                <TabIcon size={20} />
                {m.tabLabel}
              </button>
            );
          })}
        </div>

        {/* Active module content */}
        <div
          id={mod.id}
          role="tabpanel"
          aria-labelledby={`tab-${mod.id}`}
          className="mt-8"
        >
          <div className="flex flex-col md:flex-row gap-8 md:gap-14 md:items-center">
            {/* Text side */}
            <div className="flex-1 min-w-0">
              <ScrollReveal key={`headline-${mod.id}`} direction="left">
                <div className="flex items-center gap-3 mb-4">
                  <Icon size={28} />
                  <span
                    className="text-xs font-semibold tracking-[0.2em] uppercase"
                    style={{ color: mod.color }}
                  >
                    {mod.name}
                  </span>
                </div>
                <h3 className="text-[28px] md:text-[36px] font-extrabold text-[#1E293B] leading-[1.15]">
                  {mod.headline}
                </h3>
              </ScrollReveal>

              {/* Persona story card */}
              <ScrollReveal key={`story-${mod.id}`} delay={1}>
                <div
                  className="mt-6 p-5 rounded-2xl"
                  style={{ backgroundColor: mod.colorMuted }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: mod.color }}
                      aria-hidden="true"
                    >
                      {mod.persona.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1E293B]">{mod.persona}</p>
                      <p className="text-xs text-[#64748B]">{mod.personaRole}</p>
                    </div>
                  </div>
                  <p className="text-[15px] leading-[1.7] text-[#1E293B] font-semibold">
                    {mod.storyLead}
                  </p>
                  <p className="text-[14px] leading-[1.7] text-[#64748B] mt-1">
                    {mod.storyBody}
                  </p>
                </div>
              </ScrollReveal>

              {/* Solution */}
              <ScrollReveal key={`solution-${mod.id}`} delay={2}>
                <div className="mt-5">
                  <div className="editorial-divider mb-4" aria-hidden="true" />
                  <p className="text-[16px] leading-[1.7] text-[#1E293B] font-semibold">
                    {mod.solutionLead}
                  </p>
                  <p className="text-[14px] leading-[1.7] text-[#64748B] mt-1">
                    {mod.solutionBody}
                  </p>
                </div>
              </ScrollReveal>

              {/* CTA: See features */}
              <ScrollReveal key={`cta-${mod.id}`} delay={3}>
                <button
                  ref={toggleBtnRef}
                  onClick={() => setShowFeatures(true)}
                  className="mt-6 group flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200"
                  style={{
                    color: mod.color,
                    backgroundColor: mod.colorMuted,
                    border: `1.5px solid ${mod.color}`,
                  }}
                  aria-haspopup="dialog"
                >
                  Lihat 6 fitur {mod.tabLabel}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </ScrollReveal>
            </div>

            {/* Icon side — large decorative */}
            <ScrollReveal key={`icon-${mod.id}`} direction="right" className="hidden md:block">
              <div
                className="w-[260px] h-[260px] rounded-3xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: mod.colorMuted }}
                aria-hidden="true"
              >
                <Icon size={130} />
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Feature dialog */}
        {showFeatures && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Fitur ${mod.name}`}
            ref={dialogRef}
            onClick={() => closeDialog()}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
            <div
              className="relative bg-white rounded-2xl w-full max-w-[560px] max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-white rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="text-sm font-bold" style={{ color: mod.color }}>
                    Fitur {mod.name}
                  </span>
                </div>
                <button
                  data-close-btn
                  onClick={() => closeDialog()}
                  aria-label="Tutup"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F1F5F9] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 4L12 12M12 4L4 12" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mod.features.map((f, i) => (
                  <FeatureCard
                    key={f.title}
                    title={f.title}
                    desc={f.desc}
                    color={mod.color}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
