import { NextResponse } from "next/server";
import { optOutCustomer } from "@/lib/email-automations";

export const runtime = "nodejs";

function html(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${title}</title>
          <style>
            body { margin: 0; font-family: Arial, sans-serif; background: #f6f6f6; color: #111; }
            main { max-width: 620px; margin: 10vh auto; padding: 32px; background: white; border: 1px solid #ddd; }
            h1 { margin: 0 0 12px; font-size: 28px; }
            p { line-height: 1.5; }
            a { color: #D81E2A; }
          </style>
        </head>
        <body>
          <main>
            <h1>${title}</h1>
            <p>${body}</p>
            <p><a href="https://westernwheelcraft.ca">Return to Western Wheelcraft</a></p>
          </main>
        </body>
      </html>`,
    {
      status,
      headers: { "content-type": "text/html; charset=utf-8" },
    }
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customer");

  if (!customerId) {
    return html("Unable to unsubscribe", "The unsubscribe link is missing a customer reference.", 400);
  }

  const customer = await optOutCustomer(customerId, "Customer clicked unsubscribe link.");
  if (!customer) {
    return html("Unable to unsubscribe", "We could not find the matching customer record.", 404);
  }

  return html(
    "You are unsubscribed",
    "You will no longer receive non-essential follow-up emails from Western Wheelcraft. Service and appointment emails may still be sent when needed."
  );
}
