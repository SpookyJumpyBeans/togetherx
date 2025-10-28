import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  founderEmail: string;
  productName: string;
  senderName: string;
  senderEmail: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { founderEmail, productName, senderName, senderEmail, message }: ContactEmailRequest = await req.json();

    console.log("Sending contact email to:", founderEmail, "for product:", productName);

    // Send email to the founder
    const founderEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Partnership Network <onboarding@resend.dev>",
        to: [founderEmail],
        reply_to: senderEmail,
        subject: `Partnership Inquiry for ${productName}`,
        html: `
          <h2>New Partnership Inquiry</h2>
          <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
          <p><strong>Product:</strong> ${productName}</p>
          ${message ? `<p><strong>Message:</strong><br/>${message}</p>` : ''}
          <hr/>
          <p>This inquiry was sent through the Partnership Network platform.</p>
          <p>Reply directly to this email to contact ${senderName}.</p>
        `,
      }),
    });

    if (!founderEmailResponse.ok) {
      const error = await founderEmailResponse.text();
      console.error("Founder email error:", error);
      throw new Error(`Failed to send email to founder: ${error}`);
    }

    const founderData = await founderEmailResponse.json();
    console.log("Founder email sent:", founderData);

    // Send confirmation to the sender
    const senderEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Partnership Network <onboarding@resend.dev>",
        to: [senderEmail],
        subject: `Your inquiry about ${productName} has been sent`,
        html: `
          <h2>Contact Request Sent</h2>
          <p>Hi ${senderName},</p>
          <p>Your partnership inquiry for <strong>${productName}</strong> has been successfully sent to the founder.</p>
          <p>They will receive your contact details and can reach out to you directly at ${senderEmail}.</p>
          <br/>
          <p>Best regards,<br/>The Partnership Network Team</p>
        `,
      }),
    });

    if (!senderEmailResponse.ok) {
      const error = await senderEmailResponse.text();
      console.error("Sender email error:", error);
      // Don't throw here, founder email was sent successfully
    }

    const senderData = await senderEmailResponse.json();
    console.log("Sender confirmation sent:", senderData);

    return new Response(JSON.stringify({ 
      success: true,
      founderEmailId: founderData.id,
      senderEmailId: senderData.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
