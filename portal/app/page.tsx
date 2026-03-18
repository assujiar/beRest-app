export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold text-[#1B3A5C] mb-4">beRest</h1>
      <p className="text-lg text-gray-500 mb-8 text-center">
        Be at Rest with beRest.
        <br />
        Platform pengelolaan warga, usaha, sewa, dan hajatan.
      </p>
      <a
        href="https://play.google.com/store/apps/details?id=com.berest.app"
        className="bg-[#FF4600] text-white px-8 py-4 rounded-xl text-lg font-bold hover:opacity-90 transition"
      >
        Download di Play Store
      </a>
    </main>
  );
}
