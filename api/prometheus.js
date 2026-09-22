import { LuaFactory } from 'wasmoon';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { url } = req.query;

  const WEBHOOK_URL = "https://discord.com/api/webhooks/1550897343849697391/dMX8DK2a9PkWMLTY6hfHb89WAj6b4zSDC2F9mRIzKULBbO-umzpeVlKvQCIWuJbHL5gi";

  if (!url || url.trim() === "" || url === "undefined") {
    return res.status(400).send("Missing URL parameter.");
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(400).send("Failed to fetch target URL.");
    }
    const targetScript = await response.text();

    const factory = new LuaFactory();
    const lua = await factory.createEngine();

    const pipelinePath = path.join(process.cwd(), 'src/prometheus/pipeline.lua');
    const pipelineCode = fs.readFileSync(pipelinePath, 'utf-8');

    lua.global.set('targetSource', targetScript);

    const luaExecuteScript = `
      ${pipelineCode}
      
      local DeobPipeline = DeobPipeline
      local pipeline = DeobPipeline:new({ LuaVersion = "Lua51", PrettyPrint = true })
      
      deobResult = pipeline:apply(targetSource)
    `;

    await lua.doString(luaExecuteScript);
    const deobfuscatedCode = lua.global.get('deobResult');

    const finalOutput = `-- by KxDeobf\n` + (deobfuscatedCode || targetScript);

    const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);

    const embedPayload = {
      embeds: [
        {
          title: "Prometheus Deobfuscated • Success",
          color: 3066993,
          description: "Script successfully deobfuscated and attached above."
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
      `Content-Disposition: form-data; name="files[0]"; filename="deobfuscated.lua"\r\n` +
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
      return res.status(500).send("Discord Webhook upload failed: " + errText);
    }

  } catch (err) {
    console.error("Prometheus Deobf Error:", err);
    return res.status(500).send("Deobfuscation failed: " + err.message);
  }
}