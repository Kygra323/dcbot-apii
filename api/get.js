export default async function handler(req, res) {
  const { url, webhook } = req.query;

  if (!url || !webhook) {
    return res.status(400).send("Missing URL or Webhook parameter.");
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

    const discordRes = await fetch(webhook, {
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