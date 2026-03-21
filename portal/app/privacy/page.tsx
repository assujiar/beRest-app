import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi - apick",
  description: "Kebijakan privasi aplikasi apick",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[720px] mx-auto px-6 py-12">
        <h1 className="text-[28px] font-extrabold text-[#1E293B] mb-2">
          Kebijakan Privasi
        </h1>
        <p className="text-[13px] text-[#94A3B8] mb-10">
          Terakhir diperbarui: 21 Maret 2026
        </p>

        <div className="space-y-8 text-[15px] leading-[1.8] text-[#475569]">
          <section>
            <h2 className="text-[18px] font-bold text-[#1E293B] mb-3">
              1. Pendahuluan
            </h2>
            <p>
              apick (&ldquo;kami&rdquo;, &ldquo;aplikasi&rdquo;) menghargai privasi
              pengguna. Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan,
              menggunakan, dan melindungi informasi Anda saat menggunakan aplikasi
              apick yang tersedia di Google Play Store dan portal web apick.id.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1E293B] mb-3">
              2. Data yang Kami Kumpulkan
            </h2>
            <p className="mb-3">Kami mengumpulkan data berikut saat Anda menggunakan apick:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Informasi akun:</strong> Nama, alamat email (dari Google login),
                atau nomor telepon (untuk login OTP).
              </li>
              <li>
                <strong>Data profil:</strong> Foto profil (opsional), nama tampilan.
              </li>
              <li>
                <strong>Data modul:</strong> Data yang Anda masukkan ke dalam modul
                (catatan penjualan, data properti, data iuran warga, data acara). Semua
                data ini milik Anda sepenuhnya.
              </li>
              <li>
                <strong>Foto:</strong> Foto bukti bayar, foto nota, foto KTP penghuni
                (hanya jika Anda memilih mengunggahnya).
              </li>
              <li>
                <strong>Token notifikasi:</strong> Untuk mengirim push notification ke
                perangkat Anda.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1E293B] mb-3">
              3. Bagaimana Kami Menggunakan Data
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Menyediakan layanan utama aplikasi (pencatatan, laporan, notifikasi).</li>
              <li>Mengirim pengingat dan notifikasi yang Anda atur.</li>
              <li>Menampilkan data Anda di portal web apick.id (hanya data yang Anda pilih untuk dibagikan via link).</li>
              <li>Memproses gambar dengan AI (Gemini) untuk fitur scan nota dan KTP (data dikirim ke Google Gemini API, tidak disimpan oleh pihak ketiga).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1E293B] mb-3">
              4. Penyimpanan Data
            </h2>
            <p>
              Data disimpan di server Supabase (berbasis PostgreSQL) yang berlokasi di
              cloud. Data dienkripsi saat transit (HTTPS/TLS) dan saat disimpan. Kami
              menerapkan Row Level Security (RLS) sehingga setiap pengguna hanya dapat
              mengakses data miliknya sendiri.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1E293B] mb-3">
              5. Berbagi Data
            </h2>
            <p className="mb-3">Kami <strong>tidak menjual</strong> data Anda. Data hanya dibagikan dalam kondisi berikut:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Koneksi provider-consumer:</strong> Saat Anda sebagai provider
                membagikan link atau kode koneksi, consumer yang terhubung dapat melihat
                data yang relevan (status iuran, tagihan, dll).
              </li>
              <li>
                <strong>Portal publik:</strong> Data yang Anda bagikan melalui link
                apick.id dapat diakses oleh siapa saja yang memiliki link tersebut.
              </li>
              <li>
                <strong>WhatsApp:</strong> Saat Anda memilih untuk membagikan pesan/link
                via WhatsApp, data dikirim melalui aplikasi WhatsApp di perangkat Anda.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1E293B] mb-3">
              6. Hak Anda
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mengakses semua data Anda kapan saja melalui aplikasi.</li>
              <li>Mengekspor data Anda dalam format PDF atau CSV.</li>
              <li>Menghapus akun dan semua data terkait dengan menghubungi kami.</li>
              <li>Menonaktifkan notifikasi kapan saja dari pengaturan perangkat.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1E293B] mb-3">
              7. Keamanan
            </h2>
            <p>
              Kami menggunakan autentikasi aman (Google OAuth dan OTP via SMS),
              enkripsi data, dan Row Level Security untuk melindungi data Anda.
              Namun, tidak ada metode transmisi internet yang 100% aman. Kami akan
              memberitahu Anda jika terjadi pelanggaran data yang mempengaruhi
              informasi Anda.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1E293B] mb-3">
              8. Anak-anak
            </h2>
            <p>
              apick tidak ditujukan untuk anak di bawah 13 tahun. Kami tidak secara
              sengaja mengumpulkan data dari anak di bawah 13 tahun.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1E293B] mb-3">
              9. Perubahan Kebijakan
            </h2>
            <p>
              Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan akan
              diumumkan melalui aplikasi. Penggunaan berkelanjutan setelah perubahan
              berarti Anda menyetujui kebijakan yang diperbarui.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1E293B] mb-3">
              10. Hubungi Kami
            </h2>
            <p>
              Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, hubungi
              kami di:
            </p>
            <p className="mt-2 font-semibold text-[#1E293B]">
              Email: privacy@apick.id
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E2E8F0]">
          <a
            href="/"
            className="text-[14px] font-semibold text-[#FF4600] hover:underline"
          >
            &larr; Kembali ke beranda
          </a>
        </div>
      </div>
    </main>
  );
}
