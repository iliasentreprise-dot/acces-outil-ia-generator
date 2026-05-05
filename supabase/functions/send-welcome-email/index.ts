const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prenom, email } = await req.json();

    if (!prenom || !email) {
      return new Response(
        JSON.stringify({ error: "prenom and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY is not configured");

    const htmlBody =
      '<!DOCTYPE html>' +
      '<html>' +
      '<head>' +
      '<meta charset="UTF-8">' +
      '<meta name="color-scheme" content="dark">' +
      '<meta name="supported-color-schemes" content="dark">' +
      '<style>body { background-color: #060608 !important; } * { -webkit-text-size-adjust: none; }</style>' +
      '</head>' +
      '<body style="margin:0;padding:0;background-color:#060608;background:#060608;" bgcolor="#060608">' +
        '<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#060608" style="background-color:#060608;background:#060608;padding:40px 0;">' +
          '<tr><td align="center" bgcolor="#060608" style="background-color:#060608;">' +
            '<table width="600" cellpadding="0" cellspacing="0" bgcolor="#0D0D10" style="background-color:#0D0D10;background:#0D0D10;border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:48px;">' +
              '<tr><td align="center" style="padding-bottom:32px;">' +
                '<h1 style="font-family:\'Cormorant Garamond\',Georgia,serif;color:#C9A84C;font-size:28px;font-weight:300;margin:0;">⚡ DropDigital</h1>' +
              '</td></tr>' +
              '<tr><td align="center" style="padding-bottom:24px;">' +
                '<span style="display:inline-block;border:1px solid rgba(201,168,76,0.3);background:rgba(201,168,76,0.05);padding:6px 18px;border-radius:2px;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;">ACCÈS CONFIRMÉ</span>' +
              '</td></tr>' +
              '<tr><td style="color:#F5F0E8;font-size:16px;line-height:1.6;padding-bottom:24px;">' +
                'Salut <strong style="color:#C9A84C;">' + prenom + '</strong>,' +
              '</td></tr>' +
              '<tr><td style="padding-bottom:28px;">' +
                '<div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:4px;padding:24px 28px;">' +
                  '<p style="font-size:13px;color:#C9A84C;letter-spacing:2px;margin:0 0 12px;">🎁 CADEAU EXCLUSIF</p>' +
                  '<p style="font-size:15px;line-height:1.9;color:#F5F0E8;margin:0;">Félicitations — tu viens d\'avoir accès à l\'un des outils <strong style="color:#C9A84C;">les plus puissants du marché francophone.</strong></p>' +
                '</div>' +
              '</td></tr>' +
              '<tr><td style="font-size:14px;line-height:1.9;color:#B0A898;padding-bottom:24px;">' +
                'Cet outil est normalement <strong style="color:#F5F0E8;">réservé aux membres de la formation DropDigital</strong>.<br>Tu peux la découvrir ici :' +
              '</td></tr>' +
              '<tr><td style="padding-bottom:32px;">' +
                '<a href="https://systemedigitalpirate.lovable.app" target="_blank" style="display:inline-block;border:1px solid rgba(201,168,76,0.4);color:#C9A84C;padding:10px 24px;font-size:11px;letter-spacing:2px;text-decoration:none;border-radius:2px;">🏴‍☠️ VOIR LA FORMATION DROPDIGITAL</a>' +
              '</td></tr>' +
              '<tr><td style="font-size:14px;line-height:1.9;color:#B0A898;padding-bottom:28px;">' +
                'Mais parce que tu es resté <strong style="color:#F5F0E8;">jusqu\'au bout du live</strong>, voici ton accès gratuit à l\'outil :' +
              '</td></tr>' +
              '<tr><td align="center" style="padding-bottom:8px;">' +
                '<a href="https://outil-carousel-generator.lovable.app" target="_blank" style="display:inline-block;background:#C9A84C;color:#060608;padding:18px 40px;font-weight:700;font-size:13px;text-decoration:none;letter-spacing:2px;border-radius:2px;">⚡ ACCÉDER À L\'OUTIL GRATUITEMENT</a>' +
              '</td></tr>' +
              '<tr><td align="center" style="padding-bottom:32px;">' +
                '<p style="font-size:11px;color:#8B6914;letter-spacing:1px;margin:8px 0 0;">Ebook + page de vente générés en moins de 5 minutes.</p>' +
              '</td></tr>' +
              '<tr><td style="color:#B0A898;font-size:13px;line-height:1.6;border-top:1px solid rgba(201,168,76,0.1);padding-top:24px;">' +
                'Profite bien. — DropDigital' +
              '</td></tr>' +
            '</table>' +
          '</td></tr>' +
        '</table>' +
      '</body>' +
      '</html>';

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "DropDigital", email: "ilias.entreprise@gmail.com" },
        to: [{ email: email, name: prenom }],
        subject: "⚡ Ton outil DropDigital est prêt",
        htmlContent: htmlBody,
      }),
    });

    const brevoData = await brevoRes.json();

    if (!brevoRes.ok) {
      console.error("Brevo error:", brevoData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: brevoData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: brevoData.messageId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
