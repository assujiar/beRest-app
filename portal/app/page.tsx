export default function HomePage() {
  const modules = [
    { icon: "🏪", name: "Apick Lapak", desc: "Catat penjualan, laundry, les privat, jasa", color: "#10B981" },
    { icon: "🏠", name: "Apick Sewa", desc: "Kelola kos, kontrakan, rental barang", color: "#3B82F6" },
    { icon: "👥", name: "Apick Warga", desc: "Iuran RT/RW, mesjid, pengajian, komunitas", color: "#8B5CF6" },
    { icon: "🎉", name: "Apick Hajat", desc: "Undangan digital, RSVP, amplop tracker", color: "#EC4899" },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#1B3A5C] text-white py-20 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Apick</h1>
        <p className="text-xl opacity-80 mb-2">Life, well arranged.</p>
        <p className="text-base opacity-60 max-w-md mx-auto mb-8">
          1 app untuk kelola usaha, properti sewa, organisasi warga, dan hajatan.
          Dari pedagang kaki lima sampai ketua RT.
        </p>
        <a
          href="https://play.google.com/store/apps/details?id=id.apick.app"
          className="inline-block bg-[#FF4600] text-white px-8 py-4 rounded-xl text-lg font-bold hover:opacity-90 transition"
        >
          Download Gratis
        </a>
      </section>

      {/* Modules */}
      <section className="py-16 px-4 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          4 Module, 1 App
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map((m) => (
            <div key={m.name} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
              <span className="text-3xl">{m.icon}</span>
              <h3 className="text-lg font-bold mt-3" style={{ color: m.color }}>
                {m.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Kenapa Apick?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { icon: "📱", title: "Mudah Dipakai", desc: "Desain untuk pengguna yang baru pakai smartphone. 1 layar, 1 tugas." },
              { icon: "🔗", title: "Terhubung", desc: "Pengelola & pengguna terhubung real-time. Notifikasi otomatis." },
              { icon: "🌐", title: "Web Portal", desc: "Setiap data bisa dibagikan via link. Tanpa install, langsung lihat." },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-bold text-gray-900 mt-2">{f.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Mulai sekarang, gratis.
        </h2>
        <p className="text-gray-500 mb-6">Tidak perlu kartu kredit. Langsung pakai.</p>
        <a
          href="https://play.google.com/store/apps/details?id=id.apick.app"
          className="inline-block bg-[#FF4600] text-white px-8 py-4 rounded-xl text-lg font-bold hover:opacity-90 transition"
        >
          Download Apick
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 text-center">
        <p className="text-sm text-gray-400">
          © 2026 Apick. Life, well arranged.
        </p>
      </footer>
    </main>
  );
}
