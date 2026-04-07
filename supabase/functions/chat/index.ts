import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de Maya's, une crêperie, fast food et glacier au Sénégal. Tu réponds toujours en français de manière chaleureuse et professionnelle.

RÈGLES IMPORTANTES :
- Tu ne connais PAS l'adresse exacte, le numéro de téléphone, ni les horaires d'ouverture de Maya's. Si on te les demande, dis poliment que tu n'as pas cette information et invite le client à consulter les réseaux sociaux de Maya's.
- N'INVENTE JAMAIS d'adresse, numéro de téléphone, horaires ou informations de contact.
- Si un client a une réclamation, montre de l'empathie, note les détails, et dis que sa réclamation sera transmise à l'équipe. Demande son nom et numéro pour qu'on puisse le recontacter.

Tu aides les clients avec :
- Les questions sur le menu (utilise get_menu pour voir les plats disponibles et prix)
- Les suggestions de plats
- La prise de commande via place_order

PROCESSUS DE COMMANDE :
1. Quand un client veut commander, utilise d'abord get_menu pour voir les plats disponibles
2. Aide-le à choisir, confirme les quantités
3. Demande son nom et numéro de téléphone
4. Utilise place_order pour enregistrer la commande
5. Confirme avec un récapitulatif (plats, quantités, prix total)

Si le client donne TOUT en une seule fois (plats + nom + téléphone), utilise d'abord get_menu pour vérifier les plats et prix, puis place_order.

IMPORTANT : Utilise TOUJOURS les outils. Ne dis jamais au client d'aller sur le site pour commander.
Les prix sont en FCFA. Sois concis et amical. 💖`;

const tools = [
  {
    type: "function",
    function: {
      name: "get_menu",
      description: "Récupère le menu complet avec catégories, plats disponibles et prix en FCFA",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Filtrer par catégorie (optionnel)"
          }
        },
        required: [],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "place_order",
      description: "Enregistre une commande. Appelle TOUJOURS get_menu d'abord pour obtenir les vrais IDs et prix.",
      parameters: {
        type: "object",
        properties: {
          customer_name: { type: "string", description: "Nom du client" },
          customer_phone: { type: "string", description: "Téléphone du client" },
          items: {
            type: "array",
            description: "Articles commandés",
            items: {
              type: "object",
              properties: {
                menu_item_id: { type: "string", description: "UUID de l'article du menu (obtenu via get_menu)" },
                name: { type: "string", description: "Nom de l'article" },
                quantity: { type: "number", description: "Quantité" },
                unit_price: { type: "number", description: "Prix unitaire en FCFA (obtenu via get_menu)" }
              },
              required: ["menu_item_id", "quantity", "unit_price"],
              additionalProperties: false
            }
          },
          notes: { type: "string", description: "Notes spéciales (optionnel)" },
          table_number: { type: "number", description: "Numéro de table si le client est sur place (optionnel)" }
        },
        required: ["customer_name", "customer_phone", "items"],
        additionalProperties: false
      }
    }
  }
];

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function handleGetMenu(args: { category?: string }) {
  const supabase = getSupabaseAdmin();
  const { data: items, error } = await supabase
    .from("menu_items")
    .select("id, name, description, price, available, category_id, categories(name, emoji)")
    .eq("available", true)
    .order("sort_order");

  if (error) throw new Error(`Erreur menu: ${error.message}`);

  let filtered = items || [];
  if (args.category) {
    filtered = filtered.filter((i: any) =>
      i.categories?.name?.toLowerCase().includes(args.category!.toLowerCase())
    );
  }

  const grouped: Record<string, any[]> = {};
  for (const item of filtered) {
    const catName = `${item.categories?.emoji || ''} ${item.categories?.name || 'Autre'}`.trim();
    if (!grouped[catName]) grouped[catName] = [];
    grouped[catName].push({ id: item.id, name: item.name, description: item.description, price: item.price });
  }
  return JSON.stringify(grouped, null, 2);
}

async function handlePlaceOrder(args: {
  customer_name: string;
  customer_phone: string;
  items: Array<{ menu_item_id: string; name?: string; quantity: number; unit_price: number }>;
  notes?: string;
  table_number?: number;
}) {
  const supabase = getSupabaseAdmin();
  const total = args.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const orderId = crypto.randomUUID();

  const noteParts = ["Commande via chatbot IA"];
  if (args.table_number) noteParts.push(`Table ${args.table_number}`);
  if (args.notes) noteParts.push(args.notes);

  const orderData: any = {
    id: orderId,
    customer_name: args.customer_name,
    customer_phone: args.customer_phone,
    total,
    status: "pending",
    notes: noteParts.join(" | "),
  };
  if (args.table_number) orderData.table_number = args.table_number;

  const { error: orderError } = await supabase.from("orders").insert(orderData);
  if (orderError) throw new Error(`Erreur commande: ${orderError.message}`);

  const orderItems = args.items.map((item) => ({
    order_id: orderId,
    menu_item_id: item.menu_item_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));
  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) throw new Error(`Erreur articles: ${itemsError.message}`);

  return JSON.stringify({
    success: true,
    order_id: orderId,
    total,
    items_count: args.items.length,
    message: `Commande #${orderId.slice(0, 8)} enregistrée !`
  });
}

// Parse a complete SSE response into a single message object
async function parseSSEResponse(response: Response): Promise<any> {
  const text = await response.text();
  const lines = text.split("\n");
  let fullContent = "";
  let toolCalls: any[] = [];
  let role = "assistant";
  let finishReason = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data: ")) continue;
    const jsonStr = trimmed.slice(6).trim();
    if (jsonStr === "[DONE]") break;

    try {
      const parsed = JSON.parse(jsonStr);
      const choice = parsed.choices?.[0];
      if (!choice) continue;

      if (choice.delta?.role) role = choice.delta.role;
      if (choice.delta?.content) fullContent += choice.delta.content;
      if (choice.finish_reason) finishReason = choice.finish_reason;

      if (choice.delta?.tool_calls) {
        for (const tc of choice.delta.tool_calls) {
          const idx = tc.index ?? 0;
          if (!toolCalls[idx]) {
            toolCalls[idx] = { id: tc.id || "", type: "function", function: { name: "", arguments: "" } };
          }
          if (tc.id) toolCalls[idx].id = tc.id;
          if (tc.function?.name) toolCalls[idx].function.name = tc.function.name;
          if (tc.function?.arguments) toolCalls[idx].function.arguments += tc.function.arguments;
        }
      }
    } catch {
      // skip malformed chunks
    }
  }

  const message: any = { role, content: fullContent || null };
  if (toolCalls.length > 0) message.tool_calls = toolCalls;
  return { message, finish_reason: finishReason };
}

async function callAIWithTools(messages: any[], apiKey: string, maxRounds = 3): Promise<ReadableStream> {
  let conversationMessages = [...messages];

  for (let round = 0; round < maxRounds; round++) {
    // Call AI (always streaming so we can parse uniformly)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...conversationMessages],
        tools,
        stream: true,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      throw new Error(`AI error ${response.status}: ${t}`);
    }

    const { message: aiMessage, finish_reason } = await parseSSEResponse(response);
    console.log(`Round ${round}: finish_reason=${finish_reason}, tool_calls=${aiMessage.tool_calls?.length || 0}, content_len=${aiMessage.content?.length || 0}`);
    if (aiMessage.tool_calls?.length) {
      console.log("Tool calls:", JSON.stringify(aiMessage.tool_calls.map((tc: any) => ({ name: tc.function.name, args: tc.function.arguments }))));
    }

    // No tool calls → stream final response
    if (!aiMessage.tool_calls || aiMessage.tool_calls.length === 0) {
      // We already consumed the response, so create a synthetic SSE stream from the content
      return createSSEStream(aiMessage.content || "");
    }

    // Process tool calls
    conversationMessages.push(aiMessage);

    for (const tc of aiMessage.tool_calls) {
      const fnName = tc.function.name;
      let fnArgs: any;
      try {
        fnArgs = JSON.parse(tc.function.arguments || "{}");
      } catch {
        fnArgs = {};
      }
      let result: string;

      try {
        if (fnName === "get_menu") {
          result = await handleGetMenu(fnArgs);
        } else if (fnName === "place_order") {
          result = await handlePlaceOrder(fnArgs);
        } else {
          result = JSON.stringify({ error: `Outil inconnu: ${fnName}` });
        }
      } catch (e) {
        result = JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" });
      }

      console.log(`Tool ${fnName} result:`, result.slice(0, 200));

      conversationMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });
    }
  }

  // Max rounds reached, do final streaming call without tools
  const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...conversationMessages],
      stream: true,
    }),
  });

  if (!finalResponse.ok) {
    const t = await finalResponse.text();
    throw new Error(`AI final error ${finalResponse.status}: ${t}`);
  }

  return finalResponse.body!;
}

function createSSEStream(content: string): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      const chunk = {
        choices: [{ index: 0, delta: { content, role: "assistant" }, finish_reason: "stop" }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const stream = await callAIWithTools(messages, LOVABLE_API_KEY);

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);

    if (e instanceof Error && e.message.includes("429")) {
      return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (e instanceof Error && e.message.includes("402")) {
      return new Response(JSON.stringify({ error: "Service temporairement indisponible." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
