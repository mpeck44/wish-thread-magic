import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tripId, tripData, familyMembers, profile } = await req.json();
    
    // Only log in development (no DENO_DEPLOYMENT_ID means local)
    const isDev = !Deno.env.get("DENO_DEPLOYMENT_ID");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Build context for AI
    const primaryUserContext = profile 
      ? `${profile.name} (the planner, role: ${profile.family_role}, loves: ${profile.vibes?.join(', ') || 'various experiences'})` 
      : '';

    const familyContext = (familyMembers || []).map((member: any) => 
      `${member.name} (age ${member.age || 'unknown'}, energy: ${member.energy_level || 'moderate'}, interests: ${member.vibes?.join(', ') || 'various experiences'})`
    ).join(', ');

    const allTravelers = primaryUserContext 
      ? `${primaryUserContext}${familyMembers.length > 0 ? ', ' + familyContext : ''}`
      : familyContext;

    // Build trip details
    const tripDetails = `
Trip Duration: ${tripData.trip_duration} days
Budget Level: ${tripData.budget_level}
Accommodation: ${tripData.accommodation_preference}
Pace Preference: ${tripData.pace_preference}
Special Occasions: ${tripData.special_occasions?.join(', ') || 'None'}
Must-Do Experiences: ${tripData.must_do_experiences || 'None specified'}
Theme Days Enabled: ${tripData.theme_days_enabled ? 'Yes' : 'No'}
${tripData.theme_days_enabled ? `Theme Day Preferences: ${tripData.theme_day_preferences?.join(', ')}` : ''}
Additional Notes: ${tripData.additional_notes || 'None'}
`;

    const systemPrompt = `You are a Disney World trip planning expert. Create a realistic, magical ${tripData.trip_duration}-day itinerary for Walt Disney World.

Travelers: ${allTravelers}

${tripDetails}

Create a balanced itinerary that considers:
- Ages, energy levels, and preferences of family members
- The specified budget level and pace preference
- Special occasions and must-do experiences
- Theme day preferences if enabled
- Realistic wait times and park logistics
- Mix of popular attractions, dining, and rest periods
- Magic moments that match their preferences

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
- Create ${tripData.trip_duration} days of activities
- Include 5-8 attractions per day based on pace (${tripData.pace_preference})
- Include 2-3 dining experiences per day appropriate for budget level
- Include rest/relaxation periods, especially if there are young children
- Vary parks across the days (Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom)
- Be specific about locations and times
- Consider realistic wait times
- Match activities to family ages and preferences
- Incorporate theme days if enabled
- Prioritize must-do experiences`;

    if (isDev) console.log("Calling AI to generate itinerary...");

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
          { role: "user", content: `Create the perfect Disney itinerary based on the details above.` },
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
      // Log error type without sensitive details
      console.error("AI gateway error:", { status: response.status, timestamp: new Date().toISOString() });
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
    
    if (isDev) console.log("Itinerary generated, saving to database...");

    // Save the itinerary to the trip
    const { error: updateError } = await supabase
      .from("trips")
      .update({ itinerary_json: itinerary })
      .eq("id", tripId);

    if (updateError) {
      console.error("Error saving itinerary:", { errorType: updateError.name, timestamp: new Date().toISOString() });
      throw updateError;
    }

    if (isDev) console.log("Itinerary saved successfully!");

    return new Response(
      JSON.stringify({ success: true, itinerary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Log error type without sensitive details
    console.error("Error in generate-itinerary:", { 
      errorType: error instanceof Error ? error.name : "Unknown",
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ error: "Failed to generate itinerary" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
