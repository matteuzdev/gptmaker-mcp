// Deno runtime (Edge Function)
export default async (_req: Request) => {
  const tools = [{
    name: "create_agent",
    description: "Cria um agente no GPT Maker",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        avatar: { type: "string" },
        behavior: { type: "string" },
        communicationType: { type: "string", enum: ["Formal","Informal","Relaxed"] },
        type: { type: "string", enum: ["SUPPORT","SALES","ASSISTANT"] },
        jobName: { type: "string" },
        jobSite: { type: "string" },
        jobDescription: { type: "string" }
      },
      required: ["name","behavior","type","communicationType"]
    }
  }];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (e: string, d: any) =>
        controller.enqueue(encoder.encode(`event: ${e}\ndata: ${JSON.stringify(d)}\n\n`));
      // Anuncia as ferramentas ao ChatGPT
      send("capabilities", { tools });
      // Keep-alive
      const iv = setInterval(() => send("ping", {}), 15000);
      // Encerrar quando cliente fechar
      // (Edge Functions tratam fechamento automaticamente)
    }
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      "connection": "keep-alive",
      "access-control-allow-origin": "*"
    }
  });
};
