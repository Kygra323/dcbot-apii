export default async function handler(req, res) {
  const { url } = req.query;

  const WEBHOOK_URL = "https://discord.com/api/webhooks/1550897343849697391/dMX8DK2a9PkWMLTY6hfHb89WAj6b4zSDC2F9mRIzKULBbO-umzpeVlKvQCIWuJbHL5gi";

  if (!url || url.trim() === "" || url === "undefined") {
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

    const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);

    const embedPayload = {
      embeds: [
        {
          title: "Script Fetched • Success",
          color: 3066993,
          description: "Script successfully retrieved and attached below."
        }
      ]
    };

    let bodyChunks = [];

    bodyChunks.push(Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="payload_json"\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      JSON.stringify(embedPayload) + `\r\n`
    ));

    bodyChunks.push(Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="files[0]"; filename="fetched.lua"\r\n` +
      `Content-Type: text/plain\r\n\r\n` +
      finalOutput + `\r\n`
    ));

    bodyChunks.push(Buffer.from(`--${boundary}--\r\n`));

    const finalBody = Buffer.concat(bodyChunks);

    const discordRes = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": finalBody.length.toString()
      },
      body: finalBody
    });

    if (discordRes.ok) {
      return res.status(200).send("OK");
    } else {
      const errText = await discordRes.text();
      console.error("Discord Webhook Error:", errText);
      return res.status(500).send("Discord Webhook upload failed: " + errText);
    }

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).send("Internal Server Error.");
  }
}