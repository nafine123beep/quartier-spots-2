import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const SUBJECT_LABELS: Record<string, string> = {
  general: "Allgemeine Anfrage",
  spot_question: "Frage zu meinem Spot",
  event_info: "Infos zur Veranstaltung",
  problem: "Problem melden",
  other: "Sonstiges",
};

const VALID_SUBJECTS = Object.keys(SUBJECT_LABELS);

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  identifierType: "email" | "ip",
  tenantId: string
): Promise<{ allowed: boolean; resetAt: Date }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_WINDOW_MS);

  const { data: existing } = await supabase
    .from("contact_rate_limits")
    .select("*")
    .eq("identifier_type", identifierType)
    .eq("identifier_value", identifier.toLowerCase())
    .eq("tenant_id", tenantId)
    .single();

  if (!existing) {
    return { allowed: true, resetAt: new Date(now.getTime() + RATE_WINDOW_MS) };
  }

  const recordWindowStart = new Date(existing.window_start);
  if (recordWindowStart < windowStart) {
    return { allowed: true, resetAt: new Date(now.getTime() + RATE_WINDOW_MS) };
  }

  const remaining = RATE_LIMIT - existing.attempt_count;
  return {
    allowed: remaining > 0,
    resetAt: new Date(recordWindowStart.getTime() + RATE_WINDOW_MS),
  };
}

async function incrementRateLimit(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  identifierType: "email" | "ip",
  tenantId: string
): Promise<void> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_WINDOW_MS);

  const { data: existing } = await supabase
    .from("contact_rate_limits")
    .select("*")
    .eq("identifier_type", identifierType)
    .eq("identifier_value", identifier.toLowerCase())
    .eq("tenant_id", tenantId)
    .single();

  if (!existing) {
    await supabase.from("contact_rate_limits").insert({
      identifier_type: identifierType,
      identifier_value: identifier.toLowerCase(),
      tenant_id: tenantId,
      attempt_count: 1,
      window_start: now.toISOString(),
    });
    return;
  }

  const recordWindowStart = new Date(existing.window_start);
  if (recordWindowStart < windowStart) {
    await supabase
      .from("contact_rate_limits")
      .update({
        attempt_count: 1,
        window_start: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("contact_rate_limits")
      .update({
        attempt_count: existing.attempt_count + 1,
        updated_at: now.toISOString(),
      })
      .eq("id", existing.id);
  }
}

function createEmailHtml(
  senderName: string,
  senderEmail: string,
  subject: string,
  message: string,
  tenantName: string,
  eventTitle?: string
): string {
  const subjectLabel = SUBJECT_LABELS[subject] || subject;
  const eventInfo = eventTitle ? `<p><strong>Event:</strong> ${eventTitle}</p>` : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #003366; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">Neue Kontaktanfrage</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">${tenantName}</p>
  </div>
  <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
      <h2 style="margin: 0 0 15px 0; color: #003366; font-size: 18px;">Absender</h2>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${senderName}</p>
      <p style="margin: 5px 0;"><strong>E-Mail:</strong> <a href="mailto:${senderEmail}" style="color: #003366;">${senderEmail}</a></p>
      ${eventInfo}
    </div>
    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin-top: 15px;">
      <h2 style="margin: 0 0 15px 0; color: #003366; font-size: 18px;">Betreff: ${subjectLabel}</h2>
      <div style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 4px; border-left: 4px solid #003366;">${message}</div>
    </div>
    <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
      <p style="margin: 0; font-size: 14px; color: #856404;"><strong>Hinweis:</strong> Antworten Sie direkt auf diese E-Mail.</p>
    </div>
  </div>
  <div style="padding: 15px; text-align: center; color: #666; font-size: 12px;">
    <p style="margin: 0;">Gesendet via Quartier Spots Kontaktformular</p>
  </div>
</body>
</html>`.trim();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const body = await req.json();
    const { tenantId, eventId, name, email, subject, message, honeypot } = body;

    // Get client IP
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // 1. Check honeypot
    if (honeypot && honeypot.trim() !== "") {
      await supabase.from("contact_messages").insert({
        tenant_id: tenantId,
        event_id: eventId || null,
        sender_name: name,
        sender_email: email,
        subject,
        message,
        honeypot_triggered: true,
        ip_address: clientIP,
        status: "spam_detected",
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Validate fields
    if (!tenantId || !name?.trim() || !email?.trim() || !subject || !message?.trim()) {
      return new Response(
        JSON.stringify({ error: "Alle Pflichtfelder müssen ausgefüllt werden" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Bitte geben Sie eine gültige E-Mail-Adresse ein" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!VALID_SUBJECTS.includes(subject)) {
      return new Response(
        JSON.stringify({ error: "Ungültiger Betreff" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Die Nachricht darf maximal 5000 Zeichen lang sein" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Check rate limits
    const [emailLimit, ipLimit] = await Promise.all([
      checkRateLimit(supabase, email, "email", tenantId),
      checkRateLimit(supabase, clientIP, "ip", tenantId),
    ]);

    if (!emailLimit.allowed || !ipLimit.allowed) {
      await supabase.from("contact_messages").insert({
        tenant_id: tenantId,
        event_id: eventId || null,
        sender_name: name.trim(),
        sender_email: email.trim().toLowerCase(),
        subject,
        message: message.trim(),
        ip_address: clientIP,
        status: "rate_limited",
      });

      const resetAt = emailLimit.allowed ? ipLimit.resetAt : emailLimit.resetAt;
      const minutesUntilReset = Math.ceil((resetAt.getTime() - Date.now()) / 60000);

      return new Response(
        JSON.stringify({
          error: `Zu viele Anfragen. Bitte versuchen Sie es in ${minutesUntilReset} Minuten erneut.`,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Create message record
    const { data: messageRecord, error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        tenant_id: tenantId,
        event_id: eventId || null,
        sender_name: name.trim(),
        sender_email: email.trim().toLowerCase(),
        subject,
        message: message.trim(),
        ip_address: clientIP,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Fehler beim Speichern der Nachricht" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Get tenant and event info
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name")
      .eq("id", tenantId)
      .single();

    const tenantName = tenant?.name || "Organisation";

    let eventTitle: string | undefined;
    if (eventId) {
      const { data: event } = await supabase
        .from("events")
        .select("title")
        .eq("id", eventId)
        .single();
      eventTitle = event?.title;
    }

    // 6. Get recipients (active members with contact_form_emails enabled)
    const { data: members } = await supabase
      .from("memberships")
      .select(`user_id, profiles (email, notification_preferences)`)
      .eq("tenant_id", tenantId)
      .eq("status", "active");

    const recipientEmails: string[] = [];
    if (members) {
      for (const member of members) {
        const profile = member.profiles as { email?: string; notification_preferences?: { contact_form_emails?: boolean } } | null;
        if (profile?.email) {
          const wantsEmails = profile.notification_preferences?.contact_form_emails !== false;
          if (wantsEmails) {
            recipientEmails.push(profile.email);
          }
        }
      }
    }

    // 7. Send email via Resend
    let emailSuccess = false;
    let emailError: string | undefined;

    if (recipientEmails.length > 0) {
      const subjectLabel = SUBJECT_LABELS[subject] || subject;
      const htmlContent = createEmailHtml(name.trim(), email.trim(), subject, message.trim(), tenantName, eventTitle);

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${tenantName} <onboarding@resend.dev>`,
          to: recipientEmails,
          reply_to: email.trim().toLowerCase(),
          subject: `[Kontakt] ${subjectLabel} - ${name.trim()}`,
          html: htmlContent,
        }),
      });

      if (resendResponse.ok) {
        emailSuccess = true;
      } else {
        const errorData = await resendResponse.json();
        emailError = errorData.message || "Email send failed";
        console.error("Resend error:", errorData);
      }
    }

    // 8. Update message status
    await supabase
      .from("contact_messages")
      .update({
        status: emailSuccess ? "sent" : recipientEmails.length === 0 ? "sent" : "failed",
        sent_at: emailSuccess ? new Date().toISOString() : null,
        error_message: emailError || (recipientEmails.length === 0 ? "Keine Empfänger" : null),
        recipient_emails: recipientEmails,
        recipient_count: recipientEmails.length,
      })
      .eq("id", messageRecord.id);

    // 9. Increment rate limits
    await Promise.all([
      incrementRateLimit(supabase, email, "email", tenantId),
      incrementRateLimit(supabase, clientIP, "ip", tenantId),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Ein unerwarteter Fehler ist aufgetreten" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
