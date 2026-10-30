import { randomUUID } from "node:crypto";
import { validateCart } from "./_lib/validateCart.js";
import { getBookPrice } from "../src/data/bookPricing.js";

const INTENTION_URL = "https://accept.paymob.com/v1/intention/";
const CHECKOUT_URL = "https://accept.paymob.com/unifiedcheckout/";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9]{10,15}$/;
function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function validateCustomer(customer) {
  const firstName = cleanText(customer?.firstName, 50);
  const lastName = cleanText(customer?.lastName, 50);
  const email = cleanText(customer?.email, 100);
  const phone = cleanText(customer?.phone, 20).replace(/[\s-]/g, "");

  if (!firstName || !lastName) {
    return { ok: false, error: "Invalid name" };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Invalid email" };
  }
  if (!PHONE_PATTERN.test(phone)) {
    return { ok: false, error: "Invalid phone" };
  }

  return { ok: true, customer: { firstName, lastName, email, phone } };
}

function getOrigin(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = String(req.headers["x-forwarded-proto"] || "http").split(",")[0];
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const env = globalThis.process?.env || {};
  const {
    PAYMOB_API_KEY,
    PAYMOB_SECRET_KEY,
    PAYMOB_PUBLIC_KEY,
    PAYMOB_INTEGRATION_ID,
  } = env;

  if (
    !PAYMOB_API_KEY ||
    !PAYMOB_SECRET_KEY ||
    !PAYMOB_PUBLIC_KEY ||
    !PAYMOB_INTEGRATION_ID
  ) {
    return res.status(500).json({
      error: "Server is not configured",
      code: "server_not_configured",
    });
  }

  const body = req.body || {};

  if (body.paymentMethod !== "card") {
    return res.status(400).json({ error: "Payment method is not available" });
  }

  const integrationId = Number(PAYMOB_INTEGRATION_ID);

  const cart = validateCart(body.items);
  if (!cart.ok) {
    return res.status(400).json({ error: cart.error });
  }

  const customerResult = validateCustomer(body.customer);
  if (!customerResult.ok) {
    return res.status(400).json({ error: customerResult.error });
  }

  const { customer } = customerResult;

  const items = cart.items.map((item) => ({
    name: `Book ${item.id}`,
    amount: getBookPrice(item.id) * 100,
    quantity: item.qty,
  }));

  const reference = `PLUME-${Date.now()}-${randomUUID().replace(/-/g, "")}`;

  const payload = {
    amount: cart.amountCents,
    currency: "EGP",
    payment_methods: [integrationId],
    items,
    billing_data: {
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone_number: customer.phone,
    },
    special_reference: reference,
    redirection_url: `${getOrigin(req)}/payment-result`,
  };

  console.log("Paymob intention request", {
    method: body.paymentMethod,
    integrationId,
    amount: cart.amountCents,
  });

  try {
    const response = await fetch(INTENTION_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${PAYMOB_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.client_secret) {
      console.error(
        "Paymob request failed",
        response.status,
        JSON.stringify(data).slice(0, 1000)
      );
      return res.status(502).json({
        error: "Payment provider error",
        code: "provider_error",
        providerStatus: response.status,
      });
    }

    const url = `${CHECKOUT_URL}?publicKey=${encodeURIComponent(
      PAYMOB_PUBLIC_KEY
    )}&clientSecret=${encodeURIComponent(data.client_secret)}`;

    return res.status(200).json({ url, reference });
  } catch (error) {
    console.error("Paymob request threw", error?.message || "unknown");
    return res.status(502).json({
      error: "Payment provider error",
      code: "provider_unavailable",
    });
  }
}
