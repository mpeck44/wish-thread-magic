import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wish, family_members } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the family context for the prompt
    const familyContext = family_members.map((member: any) => 
      `${member.name} (age ${member.age || 'unknown'}, ${member.vibes?.join(', ') || 'no preferences'})`
    ).join(', ');

    const systemPrompt = `You are a Disney World trip planning expert. Create a realistic, magical 3-day itinerary for Walt Disney World based on the family's wish.

Family members: ${familyContext}

Create a balanced itinerary that considers:
- Ages and preferences of family members
- Realistic wait times and park logistics
- Mix of popular attractions, dining, and rest periods
- Magic moments that match their wish

Output ONLY valid JSON matching this exact schema:
{
  "days": [
    {
      "day": 1,
      "date": "Day 1",
      "park": "Magic Kingdom",
      "theme": "Classic Disney Magic",
      "attractions": [
        { "time": "9:00 AM", "name": "Seven Dwarfs Mine Train", "wait": "Lightning Lane", "for": ["Kids", "Everyone"] },
        { "time": "10:30 AM", "name": "Pirates of the Caribbean", "wait": "15 min", "for": ["Everyone"] }
      ],
      "dining": [
        { "time": "12:00 PM", "name": "Be Our Guest Restaurant", "type": "Lunch", "for": ["Everyone"] }
      ],
      "rest": { "time": "2:00 PM", "location": "Tangled Area - shaded benches", "duration": "30 min" }
    }
  ]
}

Rules:
- Include 5-7 attractions per day
- Include 2-3 dining experiences per day
- Include 1 rest/relaxation period per day
- Vary parks across the 3 days (Magic Kingdom, EPCOT, Hollywood Studios, or Animal Kingdom)
- Be specific about locations and times
- Consider realistic wait times
- Match activities to family ages and the wish`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Family wish: ${wish}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const itineraryText = data.choices?.[0]?.message?.content;
    
    if (!itineraryText) {
      throw new Error("No itinerary generated");
    }

    const itinerary = JSON.parse(itineraryText);

    return new Response(
      JSON.stringify({ itinerary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-itinerary:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
