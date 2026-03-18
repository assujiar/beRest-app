import * as FileSystem from "expo-file-system";
import { GEMINI_API_KEY, GEMINI_MODEL, GEMINI_API_URL } from "@config/gemini.config";

interface ScanNotaResult {
  items: { name: string; quantity: number; price: number; total: number }[];
  grandTotal: number;
  date: string | null;
  merchant: string | null;
}

/** Scan a receipt/nota photo using Gemini 2.5 Flash vision */
export async function scanNota(imageUri: string): Promise<ScanNotaResult> {
  // Read image as base64
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: "base64" as const,
  });

  const response = await fetch(
    `${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Kamu adalah asisten untuk membaca nota/struk belanja.
Baca gambar nota ini dan extract data dalam format JSON berikut:
{
  "items": [{"name": "nama item", "quantity": 1, "price": 10000, "total": 10000}],
  "grandTotal": 50000,
  "date": "2024-01-15" atau null jika tidak ada,
  "merchant": "nama toko" atau null jika tidak ada
}

PENTING:
- Harga dalam Rupiah (angka saja, tanpa Rp)
- Jika tidak bisa membaca, kembalikan items kosong []
- Response HANYA JSON, tanpa markdown atau penjelasan`,
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64,
                },
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

  // Parse JSON from response (strip markdown if any)
  const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(jsonStr) as ScanNotaResult;
  } catch {
    return { items: [], grandTotal: 0, date: null, merchant: null };
  }
}

/** Generate contract text using Gemini */
export async function generateContractText(params: {
  propertyName: string;
  unitName: string;
  tenantName: string;
  monthlyRent: number;
  startDate: string;
  duration: string;
  deposit: number;
}): Promise<string> {
  const response = await fetch(
    `${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Buatkan surat perjanjian sewa sederhana dalam Bahasa Indonesia dengan data:
- Properti: ${params.propertyName}
- Unit: ${params.unitName}
- Nama Penyewa: ${params.tenantName}
- Harga Sewa: Rp ${params.monthlyRent.toLocaleString("id-ID")}/bulan
- Mulai: ${params.startDate}
- Durasi: ${params.duration}
- Deposit: Rp ${params.deposit.toLocaleString("id-ID")}

Format: teks surat perjanjian formal tapi sederhana. Tidak perlu markdown.`,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Gagal generate kontrak.";
}

/** Extract KTP data from photo using Gemini */
export async function scanKTP(imageUri: string): Promise<{
  name: string | null;
  nik: string | null;
  address: string | null;
}> {
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: "base64" as const,
  });

  const response = await fetch(
    `${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Baca KTP ini dan extract dalam JSON: {"name": "...", "nik": "...", "address": "..."}. Jika tidak bisa dibaca, isi null. Response HANYA JSON.`,
              },
              {
                inline_data: { mime_type: "image/jpeg", data: base64 },
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(jsonStr);
  } catch {
    return { name: null, nik: null, address: null };
  }
}
