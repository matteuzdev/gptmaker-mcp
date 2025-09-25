exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const WORKSPACE_ID = process.env.GPTMAKER_WORKSPACE_ID;
  const API_TOKEN = process.env.GPTMAKER_TOKEN;

  try {
    const body = JSON.parse(event.body || "{}");
    const tool = body.tool_name;
    const args = body.arguments || {};

    if (tool !== "create_agent") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "tool not found" })
      };
    }

    const payload = {
      name: args.name,
      avatar: args.avatar || "",
      behavior: args.behavior,
      communicationType: args.communicationType, // "Formal" | "Informal" | "Relaxed"
      type: args.type || "SUPPORT",
      jobName: args.jobName || "",
      jobSite: args.jobSite || "",
      jobDescription: args.jobDescription || ""
    };

    const url = `https://api.gptmaker.ai/v2/workspace/${WORKSPACE_ID}/agents`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    const data = (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })();

    if (!res.ok) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, status: res.status, error: data })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, status: res.status, result: data })
    };

  } catch (e) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: String(e?.message || e) })
    };
  }
};
