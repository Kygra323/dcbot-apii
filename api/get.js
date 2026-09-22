export default async function handler(req, res) {
  const { url } = req.query;

  const WEBHOOK_URL = "https://discord.com/api/webhooks/1550897343849697391/dMX8DK2a9PkWMLTY6hfHb89WAj6b4zSDC2F9mRIzKULBbO-umzpeVlKvQCIWuJbHL5gi
";

  if (!url) {
    return res.status(400).send("Missing URL parameter.");
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Roblox/WinInet",
        "Accept": "*/*"
      }
    });

    if (!response.ok) {
      return res.status(400).send("Failed to fetch target URL.");
    }

    const scriptContent = await response.text();
    const finalOutput = `-- by KxDeobf\n` + scriptContent;

    const fileBuffer = Buffer.from(finalOutput, 'utf-8');
    const formData = new FormData();
    formData.append('files[0]', new Blob([fileBuffer]), 'fetched.lua');

    const embedPayload = {
      embeds: [
        {
          title: "Script Fetched • Success",
          color: 3066993,
          description: "Script successfully retrieved and attached below."
        }
      ]
    };

    formData.append('payload_json', JSON.stringify(embedPayload));

    const discordRes = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData
    });

    if (discordRes.ok) {
      return res.status(200).send("OK");
    } else {
      return res.status(500).send("Failed to upload file to Discord.");
    }

  } catch (err) {
    return res.status(500).send("Internal Server Error.");
  }
}