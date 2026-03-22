// Supabase Auth Hook: Custom SMS Provider via Fonnte WhatsApp
// Intercepts Supabase OTP and sends via WhatsApp instead of SMS
// Deploy: Connect repo to Supabase Dashboard → Edge Functions → Deploy
// Setup: Supabase Dashboard → Auth → Hooks → Send SMS → HTTPS → point to this function

const FONNTE_API_TOKEN = Deno.env.get("FONNTE_API_TOKEN")!;

interface AuthHookPayload {
  user: {
    phone: string;
  };
  sms: {
    otp: string;
  };
}

Deno.serve(async (req) => {
  // Verify request is from Supabase (check webhook secret)
  const hookSecret = Deno.env.get("SUPABASE_AUTH_HOOK_SECRET");
  if (hookSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${hookSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  try {
    const payload: AuthHookPayload = await req.json();
    const { phone } = payload.user;
    const { otp } = payload.sms;

    // Send OTP via Fonnte WhatsApp
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_API_TOKEN,
      },
      body: new URLSearchParams({
        target: phone,
        message: `Kode verifikasi Apick kamu: *${otp}*\n\nJangan bagikan kode ini ke siapapun.\nKode berlaku 5 menit.`,
      }),
    });

    const result = await response.json();

    if (!result.status) {
      console.error("Fonnte error:", result);
      return new Response(
        JSON.stringify({ error: `Gagal kirim OTP: ${result.reason ?? "Unknown error"}` }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log(`OTP sent via WhatsApp to ${phone}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Send OTP WhatsApp error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
