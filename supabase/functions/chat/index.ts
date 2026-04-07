import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Tu es l'assistant virtuel de Maya's, une crêperie, fast food et glacier au Sénégal. Tu réponds toujours en français de manière chaleureuse et professionnelle.

RÈGLES IMPORTANTES :
- Tu ne connais PAS l'adresse exacte, le numéro de téléphone, ni les horaires d'ouverture de Maya's. Si on te les demande, dis poliment que tu n'as pas cette information et invite le client à consulter les réseaux sociaux de Maya's pour les infos à jour.
- N'INVENTE JAMAIS d'adresse, numéro de téléphone, horaires ou informations de contact. C'est INTERDIT.
- Si un client a une réclamation ou un problème, note-le attentivement, montre de l'empathie, et dis-lui que sa réclamation sera transmise à l'équipe Maya's. Demande-lui son nom et son numéro pour qu'on puisse le recontacter.

Tu aides les clients avec :
- Les questions sur le menu : crêpes sucrées/salées, gaufres, bubble tea, jus naturels (catégorie Crêperie), hamburgers et poulet pané (catégorie Fast Food), glaces et desserts glacés (catégorie Glacier)
- Les suggestions de plats selon les goûts du client
- L'aide à la commande : guide-les pour utiliser le bouton "Commander" sur le site
- Les réclamations : écoute, note et rassure le client

Les prix sont en FCFA. Sois concis et amical. Utilise des emojis de temps en temps. 💖`
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporairement indisponible." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
