import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const payload = await req.json();
    console.log("Payload received:", JSON.stringify(payload)); // DEBUG LOG

    const newNote = payload.record;
    if (!newNote) throw new Error("No record in payload");

    const supaBaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

  
    let query = supaBaseClient
      .from("profiles")
      .select("push_token, id")
      .not("push_token", "is", null);

    
    if (newNote.user_id) {
      query = query.neq("id", newNote.user_id);
    }

    const { data: profiles, error } = await query;
    if (error) throw error;

    console.log(`Found ${profiles?.length || 0} users to notify`); // DEBUG LOG

    if (!profiles || profiles.length === 0) {
      return new Response("No target users with tokens found.", { status: 200 });
    }

    const messages = profiles.map(profile => ({
      to: profile.push_token,
      sound: "default",
      title: `New Note: ${newNote.title || 'Untitled'}`,
      body: newNote.text || "Someone added a new note!",
      data: { noteId: newNote.id }
    }));

    const result = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    const resData = await result.json();
    console.log("Expo Response:", JSON.stringify(resData)); // DEBUG LOG

    return new Response(JSON.stringify(resData), { status: 200 });

  } catch (err) {
    console.error("FUNCTION ERROR:", err.message);
    return new Response(err.message, { status: 500 });
  }
})