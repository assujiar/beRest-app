import { supabase } from "@/lib/supabase";
import { SmartBanner } from "@/components/SmartBanner";

interface Props {
  params: Promise<{ code: string }>;
}

async function getTenantData(code: string) {
  // Look up unit by tenant connection code or unit name
  const { data: unit } = await supabase
    .from("property_units").select("*, properties(name, address)")
    .or(`unit_name.eq.${code}`)
    .eq("status", "occupied").single();

  if (!unit) return null;

  const { data: billings } = await supabase
    .from("rent_billings").select("*")
    .eq("unit_id", unit.id)
    .order("period", { ascending: false }).limit(6);

  const { data: maintenance } = await supabase
    .from("maintenance_requests").select("*")
    .eq("unit_id", unit.id)
    .order("created_at", { ascending: false }).limit(5);

  return { unit, property: unit.properties, billings: billings ?? [], maintenance: maintenance ?? [] };
}

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700", unpaid: "bg-red-100 text-red-700",
  partial: "bg-yellow-100 text-yellow-700", overdue: "bg-red-100 text-red-700",
};
const STATUS_LABELS: Record<string, string> = {
  paid: "Lunas", unpaid: "Belum Bayar", partial: "Sebagian", overdue: "Terlambat",
};
const MAINT_LABELS: Record<string, string> = {
  pending: "Menunggu", in_progress: "Dikerjakan", completed: "Selesai", rejected: "Ditolak",
};

export default async function TenantPortalPage({ params }: Props) {
  const { code } = await params;
  const data = await getTenantData(code);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-xl font-bold text-gray-800">Data tidak ditemukan</h1>
          <p className="text-gray-500 mt-2">Pastikan kode yang kamu masukkan benar.</p>
        </div>
      </main>
    );
  }

  const { unit, property, billings, maintenance } = data;

  return (
    <>
      <SmartBanner />
      <main className="max-w-md mx-auto p-4 pb-20">
        <div className="text-center mb-6 pt-4">
          <p className="text-4xl mb-2">🏠</p>
          <h1 className="text-xl font-bold text-gray-900">{property.name}</h1>
          <p className="text-gray-500 text-sm">{unit.unit_name} • {unit.tenant_name}</p>
          {property.address && <p className="text-gray-400 text-xs mt-1">📍 {property.address}</p>}
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4 text-center">
          <p className="text-xs text-gray-500">Sewa per Bulan</p>
          <p className="text-2xl font-bold text-gray-900">Rp {unit.monthly_rent.toLocaleString("id-ID")}</p>
        </div>

        <h2 className="text-sm font-bold text-gray-500 mb-2">TAGIHAN</h2>
        <div className="space-y-2 mb-6">
          {billings.map((b: { id: string; period: string; amount: number; status: string; paid_date: string | null }) => (
            <div key={b.id} className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{b.period}</p>
                <p className="text-lg font-bold text-gray-900">Rp {b.amount.toLocaleString("id-ID")}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[b.status] ?? ""}`}>
                {STATUS_LABELS[b.status] ?? b.status}
              </span>
            </div>
          ))}
        </div>

        {maintenance.length > 0 && (
          <>
            <h2 className="text-sm font-bold text-gray-500 mb-2">MAINTENANCE</h2>
            <div className="space-y-2">
              {maintenance.map((m: { id: string; title: string; status: string; created_at: string }) => (
                <div key={m.id} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-900">{m.title}</p>
                    <span className="text-xs text-gray-500">{MAINT_LABELS[m.status] ?? m.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{new Date(m.created_at).toLocaleDateString("id-ID")}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">Dibuat dengan beRest</p>
      </main>
    </>
  );
}
