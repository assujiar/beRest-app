import { supabase } from "@/lib/supabase";
import { SmartBanner } from "@/components/SmartBanner";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getStorefront(slug: string) {
  const { data: biz } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!biz) return null;

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", biz.id)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  return { biz, products: products ?? [] };
}

export default async function StorefrontPage({ params }: Props) {
  const { slug } = await params;
  const data = await getStorefront(slug);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-xl font-bold text-gray-800">Toko tidak ditemukan</h1>
          <p className="text-gray-500 mt-2">Link mungkin salah atau sudah tidak aktif.</p>
        </div>
      </main>
    );
  }

  const { biz, products } = data;

  // Group by category
  const categories = new Map<string, typeof products>();
  for (const p of products) {
    const cat = p.category ?? "Lainnya";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(p);
  }

  return (
    <>
      <SmartBanner />
      <main className="max-w-md mx-auto p-4 pb-20">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <p className="text-4xl mb-2">🏪</p>
          <h1 className="text-xl font-bold text-gray-900">{biz.name}</h1>
          {biz.description && (
            <p className="text-gray-500 text-sm mt-1">{biz.description}</p>
          )}
          {biz.address && (
            <p className="text-gray-400 text-xs mt-1">📍 {biz.address}</p>
          )}
        </div>

        {/* Products */}
        {Array.from(categories.entries()).map(([cat, prods]) => (
          <div key={cat} className="mb-6">
            <h2 className="text-sm font-bold text-[#10B981] mb-2">{cat}</h2>
            <div className="space-y-2">
              {prods.map(
                (p: {
                  id: string;
                  name: string;
                  price: number;
                  description: string | null;
                  photo_url: string | null;
                }) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl p-4 border border-gray-200 flex items-center"
                  >
                    {p.photo_url && (
                      <img
                        src={p.photo_url}
                        alt={p.name}
                        className="w-16 h-16 rounded-lg object-cover mr-3"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-gray-500">{p.description}</p>
                      )}
                    </div>
                    <p className="font-bold text-[#10B981]">
                      Rp {p.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            Belum ada produk yang tersedia
          </p>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Dibuat dengan beRest
        </p>
      </main>
    </>
  );
}
