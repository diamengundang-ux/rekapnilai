export default async function handler(req, res) {
  // 1. SETUP CORS (Agar bisa diakses dari frontend manapun)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 2. TANGANI PRE-FLIGHT REQUEST
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. HANYA MENERIMA POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 4. PARSING BODY (PENTING: Terkadang Vercel mengirim body sebagai string)
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const { to, message, apikey } = body;

    // 5. VALIDASI INPUT
    if (!apikey || !to || !message) {
      return res.status(400).json({ error: 'Parameter (to, message, apikey) wajib diisi' });
    }

    console.log(`Mengirim WA ke ${to}...`);

    // 6. KIRIM KE STARSENDER (Endpoint V3)
    const response = await fetch("https://api.starsender.online/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apikey
      },
      body: JSON.stringify({
        messageType: "text",
        to: to,
        body: message
      })
    });

    // 7. AMBIL RESPON DARI STARSENDER
    const data = await response.json();

    // Cek jika StarSender memberikan error (misal API Key salah)
    if (response.status !== 200 || data.status === false) {
      console.error("StarSender Error:", data);
      return res.status(response.status).json({ 
        error: 'Gagal mengirim WA via StarSender', 
        details: data 
      });
    }

    // 8. SUKSES
    return res.status(200).json({ success: true, data: data });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
