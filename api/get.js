export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl || targetUrl.trim() === "" || targetUrl === "undefined") {
    return res.status(400).send("Lütfen bir URL belirtin.");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Roblox/WinInet",
        "Accept": "*/*"
      }
    });

    if (!response.ok) {
      return res.status(400).send("URL'ye erişilemedi veya site hata döndürdü.");
    }

    const scriptContent = await response.text();
    
    const finalOutput = `-- by KxDeobf\n` + scriptContent;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="fetched.lua"');
    
    return res.status(200).send(finalOutput);

  } catch (err) {
    return res.status(500).send("Sunucu hatası: URL çekilemedi.");
  }
}