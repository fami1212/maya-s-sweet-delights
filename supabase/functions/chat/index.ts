import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de Maya's, une crêperie, fast food et glacier au Sénégal. Tu réponds toujours en français de manière chaleureuse et professionnelle.

RÈGLES IMPORTANTES :
- Tu ne connais PAS l'adresse exacte, le numéro de téléphone, ni les horaires d'ouverture de Maya's. Si on te les demande, dis poliment que tu n'as pas cette information et invite le client à consulter les réseaux sociaux de Maya's pour les infos à jour.
- N'INVENTE JAMAIS d'adresse, numéro de téléphone, horaires ou informations de contact. C'est INTERDIT.
- Si un client a une réclamation ou un problème, note-le attentivement, montre de l'empathie, et dis-lui que sa réclamation sera transmise à l'équipe Maya's. Demande-lui son nom et son numéro pour qu'on puisse le recontacter.

Tu aides les clients avec :
- Les questions sur le menu (utilise l'outil get_menu pour voir les plats disponibles et leurs prix)
- Les suggestions de plats selon les goûts du client
- La prise de commande directe via l'outil place_order

PROCESSUS DE COMMANDE :
1. Quand un client veut commander, utilise d'abord get_menu pour voir les plats disponibles
2. Aide-le à choisir ses plats, confirme les quantités
3. Demande son nom et son numéro de téléphone
4. Une fois toutes les infos réunies, utilise place_order pour enregistrer la commande
5. Confirme la commande avec un récapitulatif (plats, quantités, prix total)

IMPORTANT : Utilise TOUJOURS les outils disponibles. Ne dis jamais au client d'aller sur le site pour commander - tu peux le faire toi-même !

Les prix sont en FCFA. Sois concis et amical. Utilise des emojis de temps en temps. 💖`;

const tools = [
  {
    type: "function",
    function: {
      name: "get_menu",
      description: "Récupère la liste complète du menu avec les catégories, plats disponibles et prix en FCFA",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Filtrer par catégorie (optionnel) : 'Crêperie', 'Fast Food', ou 'Glacier'"
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
      description: "Enregistre une commande dans la base de données. Utilise cet outil quand le client a confirmé ses plats, quantités, nom et téléphone.",
      parameters: {
        type: "object",
        properties: {
          customer_name: {
            type: "string",
            description: "Nom du client"
          },
          customer_phone: {
            type: "string",
            description: "Numéro de téléphone du client"
          },
          items: {
            type: "array",
            description: "Liste des articles commandés",
            items: {
              type: "object",
              properties: {
                menu_item_id: {
                  type: "string",
                  description: "UUID de l'article du menu"
                },
                name: {
                  type: "string",
                  description: "Nom de l'article (pour confirmation)"
                },
                quantity: {
                  type: "number",
                  description: "Quantité commandée"
                },
                unit_price: {
                  type: "number",
                  description: "Prix unitaire en FCFA"
                }
              },
              required: ["menu_item_id", "quantity", "unit_price"],
              additionalProperties: false
            }
          },
          notes: {
            type: "string",
            description: "Notes ou instructions spéciales (optionnel)"
          }
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
  
  let query = supabase
    .from("menu_items")
    .select("id, name, description, price, available, category_id, categories(name, emoji)")
    .eq("available", true)
    .order("sort_order");

  const { data: items, error } = await query;
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
    grouped[catName].push({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
    });
  }

  return JSON.stringify(grouped, null, 2);
}

async function handlePlaceOrder(args: {
  customer_name: string;
  customer_phone: string;
  items: Array<{ menu_item_id: string; name?: string; quantity: number; unit_price: number }>;
  notes?: string;
}) {
  const supabase = getSupabaseAdmin();

  const total = args.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const orderId = crypto.randomUUID();

  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    customer_name: args.customer_name,
    customer_phone: args.customer_phone,
    total,
    status: "pending",
    notes: args.notes || "Commande via chatbot IA",
  });

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
    message: `Commande #${orderId.slice(0, 8)} enregistrée avec succès !`
  });
}

async function callAIWithTools(messages: any[], apiKey: string): Promise<ReadableStream> {
  // First call: may return tool_calls
  const firstResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      tools,
      stream: false,
    }),
  });

  if (!firstResponse.ok) {
    const t = await firstResponse.text();
    throw new Error(`AI error ${firstResponse.status}: ${t}`);
  }

  const firstResult = await firstResponse.json();
  const choice = firstResult.choices?.[0];

  if (choice?.finish_reason === "tool_calls" || choice?.message?.tool_calls?.length > 0) {
    const toolCalls = choice.message.tool_calls;
    const toolMessages = [
      ...messages,
      choice.message, // assistant message with tool_calls
    ];

    // Execute all tool calls
    for (const tc of toolCalls) {
      const fnName = tc.function.name;
      const fnArgs = JSON.parse(tc.function.arguments || "{}");
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

      toolMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });
    }

    // Second call: stream the final response with tool results
    const secondResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...toolMessages],
        stream: true,
      }),
    });

    if (!secondResponse.ok) {
      const t = await secondResponse.text();
      throw new Error(`AI error on second call ${secondResponse.status}: ${t}`);
    }

    return secondResponse.body!;
  }

  // No tool calls: stream directly
  // Re-call with streaming since first was non-streaming
  const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: true,
    }),
  });

  if (!streamResponse.ok) {
    const t = await streamResponse.text();
    throw new Error(`AI stream error ${streamResponse.status}: ${t}`);
  }

  return streamResponse.body!;
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
