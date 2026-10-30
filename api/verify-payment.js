import { getVerifiedPaymentSummary } from "./_lib/verifyPayment.js";

const AUTH_URL = "https://accept.paymob.com/api/auth/tokens";
const INQUIRY_URL =
  "https://accept.paymob.com/api/ecommerce/orders/transaction_inquiry";
const REFERENCE_PATTERN = /^PLUME-\d+-[a-z0-9]+$/i;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const env = globalThis.process?.env || {};
  const reference = String(req.body?.reference || "").trim();

  if (!REFERENCE_PATTERN.test(reference)) {
    return res.status(400).json({ error: "Invalid payment reference" });
  }

  if (
    !env.PAYMOB_API_KEY ||
    !Number.isSafeInteger(Number(env.PAYMOB_INTEGRATION_ID)) ||
    Number(env.PAYMOB_INTEGRATION_ID) <= 0
  ) {
    return res.status(500).json({ error: "Payment verification is not configured" });
  }

  try {
    const authResponse = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: env.PAYMOB_API_KEY }),
    });
    const authData = await authResponse.json().catch(() => ({}));

    if (!authResponse.ok || typeof authData.token !== "string") {
      return res.status(502).json({ error: "Payment provider error" });
    }

    const inquiryResponse = await fetch(INQUIRY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authData.token,
        merchant_order_id: reference,
      }),
    });

    if (inquiryResponse.status === 404) {
      return res.status(200).json({ status: "not_found" });
    }

    const transaction = await inquiryResponse.json().catch(() => ({}));
    if (!inquiryResponse.ok) {
      return res.status(502).json({ error: "Payment provider error" });
    }

    const payment = getVerifiedPaymentSummary(
      transaction,
      reference,
      env.PAYMOB_INTEGRATION_ID
    );

    if (!payment) {
      return res.status(404).json({ error: "Payment could not be verified" });
    }

    return res.status(200).json(payment);
  } catch {
    return res.status(502).json({ error: "Payment provider error" });
  }
}
