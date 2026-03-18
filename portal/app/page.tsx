"use client";

import { useState } from "react";

/* ─── Flat Vector SVG Icons ─── */

function IconLapak({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="8" y="20" width="48" height="6" rx="3" fill="#10B981" />
      <path d="M8 26 Q14 32 20 26 Q26 32 32 26 Q38 32 44 26 Q50 32 56 26" fill="#10B981" stroke="#059669" strokeWidth="1.5" />
      <rect x="12" y="30" width="40" height="22" rx="2" fill="#D1FAE5" stroke="#10B981" strokeWidth="1.5" />
      <rect x="26" y="38" width="12" height="14" rx="1" fill="#10B981" />
      <circle cx="35" cy="46" r="1.5" fill="#059669" />
      <rect x="16" y="34" width="8" height="8" rx="1" fill="#ECFDF5" stroke="#10B981" strokeWidth="1" />
      <line x1="20" y1="34" x2="20" y2="42" stroke="#10B981" strokeWidth="0.8" />
      <line x1="16" y1="38" x2="24" y2="38" stroke="#10B981" strokeWidth="0.8" />
    </svg>
  );
}

function IconSewa({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M10 28 L32 10 L54 28" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" />
      <rect x="14" y="28" width="36" height="24" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
      <circle cx="32" cy="37" r="5" fill="#3B82F6" />
      <circle cx="32" cy="37" r="2.5" fill="#EFF6FF" />
      <rect x="31" y="42" width="2" height="7" rx="1" fill="#3B82F6" />
      <rect x="33" y="45" width="3" height="1.5" rx="0.5" fill="#3B82F6" />
      <rect x="33" y="47" width="2" height="1.5" rx="0.5" fill="#3B82F6" />
      <rect x="18" y="32" width="6" height="6" rx="1" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="0.8" />
      <rect x="40" y="32" width="6" height="6" rx="1" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="0.8" />
    </svg>
  );
}

function IconWarga({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="20" r="7" fill="#8B5CF6" />
      <path d="M20 44 Q20 33 32 33 Q44 33 44 44" fill="#C4B5FD" stroke="#8B5CF6" strokeWidth="1.5" />
      <circle cx="16" cy="24" r="5" fill="#A78BFA" />
      <path d="M8 42 Q8 34 16 34 Q22 34 23 38" fill="#DDD6FE" stroke="#8B5CF6" strokeWidth="1" />
      <circle cx="48" cy="24" r="5" fill="#A78BFA" />
      <path d="M56 42 Q56 34 48 34 Q42 34 41 38" fill="#DDD6FE" stroke="#8B5CF6" strokeWidth="1" />
      <circle cx="44" cy="44" r="6" fill="#8B5CF6" />
      <path d="M41 44 L43.5 46.5 L47 41.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHajat({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="8" y="18" width="48" height="32" rx="4" fill="#FCE7F3" stroke="#EC4899" strokeWidth="1.5" />
      <path d="M8 22 L32 38 L56 22" fill="#FBCFE8" stroke="#EC4899" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M27 28 Q27 24 31 24 Q33 24 33 27 Q33 24 35 24 Q39 24 39 28 Q39 33 33 37 Q27 33 27 28Z" fill="#EC4899" />
      <circle cx="18" cy="14" r="1.5" fill="#F9A8D4" />
      <circle cx="48" cy="12" r="2" fill="#FBCFE8" />
      <path d="M14 10 L15 8 L16 10 L18 11 L16 12 L15 14 L14 12 L12 11Z" fill="#EC4899" />
    </svg>
  );
}

/* ─── Module Data ─── */

const modules = [
  {
    id: "lapak",
    name: "apick lapak",
    color: "#10B981",
    colorLight: "#D1FAE5",
    colorMuted: "#ECFDF5",
    icon: IconLapak,
    headline: "Catat dagangan,\nfokus jualan.",
    persona: "Pak Edi",
    personaRole: "Pedagang Nasi Goreng",
    storyLead: "Tiap malam jualan. Tiap pagi lupa berapa omzet kemarin.",
    storyBody: "Nota kertas hilang kena minyak. Istri nanya \"untung berapa bulan ini?\", bingung jawabnya. Bukan karena ga laku, tapi karena ga pernah dicatat bener.",
    solutionLead: "Sekarang Pak Edi tap 1 tombol tiap kali ada yang beli.",
    solutionBody: "Malam selesai jualan, langsung keliatan: omzet hari ini, untung bersih, trend mingguan. Semua otomatis. Ga perlu kalkulator.",
    features: [
      { num: "01", title: "1-Tap Catat Jualan", desc: "Ketuk produk, otomatis tercatat. Secepat terima uang, secepat itu nyatatnya." },
      { num: "02", title: "4 Mode Usaha", desc: "Pedagang, laundry (tracking 6 tahap), guru/pelatih (jadwal + billing), jasa antrian. Satu app." },
      { num: "03", title: "Untung Rugi Otomatis", desc: "Catat pengeluaran, apick hitung profit. Harian, mingguan, bulanan. Lengkap dengan grafik." },
      { num: "04", title: "Scan Nota AI", desc: "Foto struk belanja bahan, AI langsung baca dan masukkan sebagai pengeluaran. Tanpa ketik." },
      { num: "05", title: "Database Pelanggan", desc: "Data pelanggan terkumpul otomatis. Siapa yang paling sering beli, total belanja berapa." },
      { num: "06", title: "Web Katalog", desc: "Link apick.id/wk/namalapak yang bisa dishare. Pelanggan lihat menu dan harga dari browser, tanpa install." },
    ],
  },
  {
    id: "sewa",
    name: "apick sewa",
    color: "#3B82F6",
    colorLight: "#DBEAFE",
    colorMuted: "#EFF6FF",
    icon: IconSewa,
    headline: "Kelola properti,\ntanpa ribet.",
    persona: "Bu Ratna",
    personaRole: "Pemilik 12 Kamar Kos",
    storyLead: "Tiap bulan pusing ngingetin anak kos bayar.",
    storyBody: "Ada yang telat 3 bulan. Ada yang minta AC dibenerin dari minggu lalu. Kamar kosong belum diiklanin. Catatannya? Buku tulis yang udah kumel.",
    solutionLead: "Semua status kamar, 1 layar.",
    solutionBody: "Siapa yang udah bayar, siapa yang nunggak, maintenance mana yang belum dikerjain. Reminder otomatis ke anak kos tiap tanggal jatuh tempo.",
    features: [
      { num: "01", title: "Dashboard Properti", desc: "Kamar terisi, kosong, total pemasukan. Semua di 1 layar. Punya 5 properti? Tinggal swipe." },
      { num: "02", title: "Tagihan Otomatis", desc: "Set jatuh tempo sekali, apick generate tagihan tiap bulan. Penghuni upload bukti bayar dari app." },
      { num: "03", title: "Laporan Maintenance", desc: "Penghuni lapor kerusakan langsung dari app. Masuk ke dashboard dengan priority level." },
      { num: "04", title: "Kontrak Digital", desc: "Template kontrak, isi data penghuni, simpan di vault digital. Ga perlu folder fisik." },
      { num: "05", title: "Rental Barang", desc: "Track stok rental (kamera, sound system, camping). Siapa minjem, kapan balikin, biaya otomatis." },
      { num: "06", title: "Share Kamar Kosong", desc: "1 tap share info kamar kosong (harga, fasilitas, foto) ke WhatsApp. Satu-satu atau semua." },
    ],
  },
  {
    id: "warga",
    name: "apick warga",
    color: "#8B5CF6",
    colorLight: "#EDE9FE",
    colorMuted: "#F5F3FF",
    icon: IconWarga,
    headline: "Iuran transparan,\nwarga tenang.",
    persona: "Pak Bambang",
    personaRole: "Bendahara RT, 3 Tahun",
    storyLead: "Tiap bulan nagih iuran door-to-door. Dicatat di buku.",
    storyBody: "Akhir tahun diminta laporan, harus ngitung ulang dari Januari. Ada warga yang nanya \"duit iuran dipake buat apa?\" dan harus buka-buka buku lagi. Capek, tapi ga enak kalau ga transparan.",
    solutionLead: "Semua iuran tercatat digital. Laporan? Share link.",
    solutionBody: "Warga bisa cek status bayar sendiri. Laporan keuangan otomatis update, transparan, ga ada yang curiga. Pak Bambang bisa fokus kerja, bukan ngitung.",
    features: [
      { num: "01", title: "Organisasi Fleksibel", desc: "RT/RW, pengajian, mesjid, arisan, komunitas. Apa aja yang butuh iuran dan anggota." },
      { num: "02", title: "Catat Iuran 1 Tap", desc: "Checklist siapa yang bayar. Otomatis keliatan yang nunggak. Reminder ke WhatsApp langsung." },
      { num: "03", title: "Laporan Publik", desc: "Link apick.id/rt/laporan bisa dibagikan. Seluruh warga lihat pemasukan, pengeluaran, saldo. Real-time." },
      { num: "04", title: "Mode Mesjid", desc: "Catat infaq harian (bisa anonim), fundraising dengan progress bar, laporan infaq publik." },
      { num: "05", title: "Pengumuman", desc: "Buat pengumuman, track siapa yang udah baca. Share ke WhatsApp group juga bisa." },
      { num: "06", title: "Jadwal Piket", desc: "Atur jadwal ronda, piket kebersihan, jadwal imam. Request tukar jadwal, semua tercatat." },
    ],
  },
  {
    id: "hajat",
    name: "apick hajat",
    color: "#EC4899",
    colorLight: "#FCE7F3",
    colorMuted: "#FDF2F8",
    icon: IconHajat,
    headline: "Undang tamu,\ntanpa drama.",
    persona: "Mbak Dina",
    personaRole: "Calon Pengantin",
    storyLead: "Undangan digital di platform lain, Rp 150.000 cuma buat 1 template.",
    storyBody: "Input tamu satu-satu, ga bisa tracking siapa yang konfirmasi. Pas hari H, ngitung amplop manual sambil senyum-senyum ke tamu. Ribet banget padahal harusnya bahagia.",
    solutionLead: "Bikin undangan gratis. Teks dibuatin AI.",
    solutionBody: "Share ke WhatsApp per orang. Tamu RSVP dari link, tanpa install app. Hari H tinggal checklist kehadiran. Amplop dicatat, total keliatan real-time.",
    features: [
      { num: "01", title: "7 Jenis Acara", desc: "Nikahan, khitanan, aqiqah, tahlilan, syukuran, ulang tahun, acara custom. Template sesuai." },
      { num: "02", title: "AI Bikin Undangan", desc: "Ketik nama acara + tanggal, AI buatkan teks sopan siap share ke WhatsApp. Tinggal edit." },
      { num: "03", title: "RSVP Tracking", desc: "Tamu dapat link personal. Konfirmasi hadir/tidak dari browser. Status masuk dashboard real-time." },
      { num: "04", title: "Check-in Hari H", desc: "Checklist tamu yang datang. Keliatan yang confirmed tapi absent, dan yang datang tanpa konfirmasi." },
      { num: "05", title: "Amplop Tracker", desc: "Catat amplop saat acara. Dari siapa, berapa. Total keliatan langsung. Ga perlu ngitung di rumah." },
      { num: "06", title: "Saran Amplop", desc: "Mau ke acara teman? apick kasih saran nominal wajar berdasarkan jenis acara dan hubungan." },
    ],
  },
];

/* ─── Module Editorial Section ─── */

function ModuleEditorial({
  mod,
  index,
  isExpanded,
  onToggle,
}: {
  mod: (typeof modules)[0];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const Icon = mod.icon;
  const isReversed = index % 2 !== 0;

  return (
    <article id={mod.id} className="border-t border-[#E2E8F0]">
      {/* Module header bar */}
      <div className="max-w-[960px] mx-auto px-6 py-4 flex items-center gap-3">
        <Icon size={24} />
        <span
          className="text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: mod.color }}
        >
          {mod.name}
        </span>
      </div>

      {/* Hero split — headline + icon */}
      <div className="max-w-[960px] mx-auto px-6 pb-16 pt-4">
        <div
          className={`flex flex-col gap-10 ${
            isReversed ? "md:flex-row-reverse" : "md:flex-row"
          } md:items-center md:gap-16`}
        >
          {/* Text side */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[32px] leading-[1.15] md:text-[44px] md:leading-[1.1] font-extrabold text-[#1E293B] whitespace-pre-line">
              {mod.headline}
            </h2>

            {/* Persona card */}
            <div
              className="mt-8 p-5 rounded-2xl"
              style={{ backgroundColor: mod.colorMuted }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: mod.color }}
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
              <p className="text-[15px] leading-[1.7] text-[#64748B] mt-2">
                {mod.storyBody}
              </p>
            </div>

            {/* Solution */}
            <div className="mt-6">
              <div className="editorial-divider mb-4" />
              <p className="text-[17px] leading-[1.7] text-[#1E293B] font-semibold">
                {mod.solutionLead}
              </p>
              <p className="text-[15px] leading-[1.7] text-[#64748B] mt-1">
                {mod.solutionBody}
              </p>
            </div>
          </div>

          {/* Icon side */}
          <div className="hidden md:flex flex-shrink-0 w-[280px] h-[280px] rounded-3xl items-center justify-center"
            style={{ backgroundColor: mod.colorMuted }}
          >
            <Icon size={140} />
          </div>
        </div>

        {/* Learn more */}
        <div className="mt-10">
          <button
            onClick={onToggle}
            className="group flex items-center gap-3 text-sm font-semibold transition-colors"
            style={{ color: mod.color }}
          >
            <span className="border-b border-current pb-0.5">
              {isExpanded ? "Tutup detail" : "Lihat semua fitur"}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className={`transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <path
                d="M3 5.5L7 9.5L11 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Feature grid */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isExpanded
                ? "max-h-[1200px] opacity-100 mt-8"
                : "max-h-0 opacity-0 mt-0"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {mod.features.map((f) => (
                <div key={f.num} className="flex gap-4">
                  <span
                    className="text-[13px] font-bold mt-0.5 shrink-0 w-7"
                    style={{ color: mod.color }}
                  >
                    {f.num}
                  </span>
                  <div>
                    <h4 className="text-[15px] font-bold text-[#1E293B]">
                      {f.title}
                    </h4>
                    <p className="text-[14px] leading-[1.65] text-[#64748B] mt-1">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─── Main Page ─── */

export default function HomePage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-white text-[#1E293B]">
      {/* ═══ Masthead ═══ */}
      <header className="bg-[#1B3A5C]">
        <div className="max-w-[960px] mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-white text-[22px] font-extrabold tracking-tight">
            apick
          </h1>
          <a
            href="https://play.google.com/store/apps/details?id=id.apick.app"
            className="text-white/70 text-[13px] font-medium hover:text-white transition-colors"
          >
            Download
          </a>
        </div>
      </header>

      {/* ═══ Hero — editorial style ═══ */}
      <section className="bg-[#1B3A5C] text-white pb-20 pt-12 md:pt-20">
        <div className="max-w-[960px] mx-auto px-6">
          {/* Kicker */}
          <p className="text-[13px] font-semibold tracking-[0.2em] uppercase text-[#FF4600] mb-6">
            Satu app, empat solusi
          </p>

          {/* Main headline */}
          <h2 className="text-[40px] leading-[1.1] md:text-[64px] md:leading-[1.05] font-extrabold tracking-tight max-w-[640px]">
            Hidup rapi dimulai dari catatan yang bener.
          </h2>

          {/* Subhead */}
          <p className="mt-6 text-[18px] md:text-[20px] leading-[1.6] text-white/60 max-w-[520px]">
            Pedagang kaki lima. Ibu kos. Bendahara RT. Calon pengantin. Semua
            punya satu kesamaan: butuh app yang simpel buat ngatur hidup.
          </p>

          {/* CTA row */}
          <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
            <a
              href="https://play.google.com/store/apps/details?id=id.apick.app"
              className="inline-flex items-center gap-2.5 bg-[#FF4600] text-white px-7 py-3.5 rounded-xl text-[15px] font-bold hover:bg-[#E63E00] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5Z" fill="white" />
                <path d="M16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12Z" fill="white" opacity="0.8" />
                <path d="M20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81Z" fill="white" opacity="0.6" />
                <path d="M6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" fill="white" opacity="0.9" />
              </svg>
              Download Gratis
            </a>
            <a
              href="#lapak"
              className="text-white/40 text-[14px] hover:text-white/70 transition-colors py-3.5"
            >
              Baca dulu &#8595;
            </a>
          </div>

          {/* Module pills */}
          <div className="mt-14 flex flex-wrap gap-2">
            {modules.map((m) => (
              <a
                key={m.id}
                href={`#${m.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
              >
                <m.icon size={16} />
                {m.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Pull quote ═══ */}
      <section className="border-t border-b border-[#E2E8F0] py-14 md:py-20">
        <div className="max-w-[960px] mx-auto px-6 text-center">
          <p className="editorial-serif text-[22px] md:text-[28px] leading-[1.5] text-[#64748B] max-w-[640px] mx-auto">
            &ldquo;Kalau bisa buka WhatsApp, bisa pakai apick.&rdquo;
          </p>
          <p className="mt-4 text-[13px] font-semibold tracking-[0.15em] uppercase text-[#94A3B8]">
            Prinsip desain kami
          </p>
        </div>
      </section>

      {/* ═══ Modules ═══ */}
      {modules.map((mod, i) => (
        <ModuleEditorial
          key={mod.id}
          mod={mod}
          index={i}
          isExpanded={expanded === mod.id}
          onToggle={() =>
            setExpanded(expanded === mod.id ? null : mod.id)
          }
        />
      ))}

      {/* ═══ How it works ═══ */}
      <section className="border-t border-[#E2E8F0] py-16 md:py-20">
        <div className="max-w-[960px] mx-auto px-6">
          <p className="text-[13px] font-semibold tracking-[0.2em] uppercase text-[#FF4600] mb-4">
            Mulai
          </p>
          <h2 className="text-[32px] md:text-[40px] font-extrabold leading-[1.1] text-[#1E293B] mb-12">
            2 menit, langsung pakai.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                num: "1",
                title: "Download & Login",
                desc: "Login pakai Google atau nomor HP. Itu aja.",
              },
              {
                num: "2",
                title: "Pilih Modul",
                desc: "Lapak? Kos-kosan? RT? Hajatan? Aktifin yang kamu butuh.",
              },
              {
                num: "3",
                title: "Langsung Jalan",
                desc: "Ikuti panduan pertama. Data langsung bisa diisi. Gratis, tanpa trial.",
              },
            ].map((s) => (
              <div key={s.num}>
                <span className="text-[48px] font-extrabold text-[#E2E8F0] leading-none">
                  {s.num}
                </span>
                <h3 className="text-[17px] font-bold text-[#1E293B] mt-3">
                  {s.title}
                </h3>
                <p className="text-[14px] leading-[1.65] text-[#64748B] mt-2">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Three pillars ═══ */}
      <section className="bg-[#F8FAFC] border-t border-[#E2E8F0] py-16 md:py-20">
        <div className="max-w-[960px] mx-auto px-6">
          <p className="text-[13px] font-semibold tracking-[0.2em] uppercase text-[#94A3B8] mb-4">
            Kenapa apick
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mt-8">
            <div>
              <div className="editorial-divider mb-5" />
              <h3 className="text-[17px] font-bold text-[#1E293B] mb-2">
                Gampang banget
              </h3>
              <p className="text-[14px] leading-[1.7] text-[#64748B]">
                1 layar, 1 tugas. Bahasa manusia, bukan bahasa komputer. Tombol
                gede, tulisan jelas. Dibuat untuk orang yang bukan &ldquo;tech
                savvy&rdquo;. Dan itu bukan masalah.
              </p>
            </div>
            <div>
              <div className="editorial-divider mb-5" />
              <h3 className="text-[17px] font-bold text-[#1E293B] mb-2">
                Nyambung real-time
              </h3>
              <p className="text-[14px] leading-[1.7] text-[#64748B]">
                Kamu catat, pelanggan langsung lihat. Warga bayar iuran,
                bendahara langsung tau. Penghuni lapor kerusakan, pemilik kos
                langsung terima. Tanpa telepon.
              </p>
            </div>
            <div>
              <div className="editorial-divider mb-5" />
              <h3 className="text-[17px] font-bold text-[#1E293B] mb-2">
                Bisa via browser
              </h3>
              <p className="text-[14px] leading-[1.7] text-[#64748B]">
                Setiap data bisa di-share via link. Pelanggan, penyewa, warga,
                cukup klik link di WhatsApp. Ga perlu install app, ga perlu
                daftar. Langsung lihat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Stats band ═══ */}
      <section className="border-t border-[#E2E8F0] py-14">
        <div className="max-w-[960px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "4", label: "Modul" },
              { value: "Gratis", label: "Tanpa kartu kredit" },
              { value: "< 2 mnt", label: "Mulai pakai" },
              { value: "24/7", label: "Data aman" },
            ].map((s) => (
              <div key={s.label} className="text-center md:text-left">
                <p className="text-[28px] md:text-[36px] font-extrabold text-[#1B3A5C] leading-none">
                  {s.value}
                </p>
                <p className="text-[13px] text-[#94A3B8] mt-1 font-medium">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="bg-[#1B3A5C] py-20 md:py-24">
        <div className="max-w-[960px] mx-auto px-6">
          <h2 className="text-[32px] md:text-[44px] font-extrabold text-white leading-[1.1] max-w-[480px]">
            Udah capek ngitung manual?
          </h2>
          <p className="mt-4 text-[16px] leading-[1.6] text-white/50 max-w-[400px]">
            Download sekarang. Gratis, langsung pakai, tanpa iklan.
          </p>
          <a
            href="https://play.google.com/store/apps/details?id=id.apick.app"
            className="mt-8 inline-flex items-center gap-2.5 bg-[#FF4600] text-white px-7 py-3.5 rounded-xl text-[15px] font-bold hover:bg-[#E63E00] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5Z" fill="white" />
              <path d="M16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12Z" fill="white" opacity="0.8" />
              <path d="M20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81Z" fill="white" opacity="0.6" />
              <path d="M6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" fill="white" opacity="0.9" />
            </svg>
            Download apick
          </a>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-[#152E4A] text-white/40 py-10">
        <div className="max-w-[960px] mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="text-white text-[15px] font-bold">apick</span>
            <span className="text-[13px]">Life, well arranged.</span>
          </div>
          <div className="flex items-center gap-5 text-[13px]">
            {modules.map((m) => (
              <a
                key={m.id}
                href={`#${m.id}`}
                className="hover:text-white/70 transition-colors capitalize"
              >
                {m.id}
              </a>
            ))}
          </div>
        </div>
        <div className="max-w-[960px] mx-auto px-6 mt-6 pt-6 border-t border-white/10">
          <p className="text-[12px] text-white/25">
            &copy; 2026 apick. Dibuat di Indonesia.
          </p>
        </div>
      </footer>
    </main>
  );
}
