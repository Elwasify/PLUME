import assert from "node:assert/strict";
import { test } from "node:test";
import createPaymentHandler from "../api/create-payment.js";
import { getVerifiedPaymentSummary } from "../api/_lib/verifyPayment.js";
import { getBookPrice } from "../src/data/bookPricing.js";
import verifyPaymentHandler from "../api/verify-payment.js";

const reference = "PLUME-1761782400000-test123";

function makeTransaction(overrides = {}) {
  return {
    id: 123456,
    pending: false,
    amount_cents: 2500,
    success: true,
    error_occured: false,
    integration_id: 98765,
    currency: "EGP",
    created_at: "2026-10-29T09:00:00Z",
    paid_at: "2026-10-29T09:01:00Z",
    refunded_amount_cents: 0,
    is_refund: false,
    is_refunded: false,
    is_void: false,
    is_voided: false,
    order: {
      id: 654321,
      merchant_order_id: reference,
      amount_cents: 2500,
      currency: "EGP",
      is_cancel: false,
      is_canceled: false,
      is_returned: false,
    },
    ...overrides,
  };
}

function makeResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function saveEnvironment(names) {
  const env = globalThis.process.env;
  const previous = Object.fromEntries(names.map((name) => [name, env[name]]));

  return () => {
    for (const name of names) {
      if (previous[name] === undefined) delete env[name];
      else env[name] = previous[name];
    }
  };
}

const paymentEnvironmentNames = [
  "PAYMOB_API_KEY",
  "PAYMOB_SECRET_KEY",
  "PAYMOB_PUBLIC_KEY",
  "PAYMOB_INTEGRATION_ID",
];

function configurePaymentEnvironment(env) {
  env.PAYMOB_API_KEY = "test-api-key-for-mock";
  env.PAYMOB_SECRET_KEY = "test-secret-key-for-mock";
  env.PAYMOB_PUBLIC_KEY = "test-public-key-for-mock";
  env.PAYMOB_INTEGRATION_ID = "98765";
}

test("rejects payment creation when Paymob is not configured", async (t) => {
  const env = globalThis.process.env;
  const restoreEnvironment = saveEnvironment(paymentEnvironmentNames);
  for (const name of paymentEnvironmentNames) delete env[name];
  t.after(restoreEnvironment);

  const res = makeResponse();
  await createPaymentHandler(
    {
      method: "POST",
      body: { items: [{ id: "OL66554W", qty: 1 }] },
      headers: { host: "localhost:3000" },
    },
    res
  );

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    error: "Server is not configured",
    code: "server_not_configured",
  });
});

test("rejects invalid payment details without contacting Paymob", async (t) => {
  const env = globalThis.process.env;
  const restoreEnvironment = saveEnvironment(paymentEnvironmentNames);
  const previousFetch = globalThis.fetch;
  configurePaymentEnvironment(env);
  globalThis.fetch = async () => {
    throw new Error("Paymob should not be called for invalid details");
  };
  t.after(() => {
    restoreEnvironment();
    globalThis.fetch = previousFetch;
  });

  const res = makeResponse();
  await createPaymentHandler(
    {
      method: "POST",
      body: {
        items: [{ id: "OL66554W", qty: 1 }],
        customer: {
          firstName: "Reader",
          lastName: "Example",
          email: "invalid-email",
          phone: "+201234567890",
        },
        paymentMethod: "card",
      },
      headers: { host: "localhost:3000" },
    },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: "Invalid email" });
});

test("creates a Paymob checkout using validated server-side prices", async (t) => {
  const env = globalThis.process.env;
  const restoreEnvironment = saveEnvironment(paymentEnvironmentNames);
  const previousFetch = globalThis.fetch;
  const requests = [];
  configurePaymentEnvironment(env);
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return {
      ok: true,
      status: 201,
      json: async () => ({
        client_secret: "mock-client-secret",
      }),
    };
  };
  t.after(() => {
    restoreEnvironment();
    globalThis.fetch = previousFetch;
  });

  const res = makeResponse();
  await createPaymentHandler(
    {
      method: "POST",
      body: {
        items: [{ id: "ol66554w", qty: 2 }],
        customer: {
          firstName: "Reader",
          lastName: "Example",
          email: "reader@example.com",
          phone: "+20 123 456 7890",
        },
        paymentMethod: "card",
      },
      headers: { host: "localhost:3000", "x-forwarded-proto": "http" },
    },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.match(res.body.reference, /^PLUME-\d+-[a-f0-9]+$/);
  assert.match(
    res.body.url,
    /^https:\/\/accept\.paymob\.com\/unifiedcheckout\/\?/
  );
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://accept.paymob.com/v1/intention/");

  const payload = JSON.parse(requests[0].options.body);
  assert.equal(payload.amount, getBookPrice("OL66554W") * 200);
  assert.equal(payload.currency, "EGP");
  assert.deepEqual(payload.payment_methods, [98765]);
  assert.equal(payload.items[0].quantity, 2);
  assert.equal(payload.billing_data.phone_number, "+201234567890");
  assert.equal(payload.redirection_url, "http://localhost:3000/payment-result");
});

test("verifies a successful Paymob transaction summary", () => {
  const payment = getVerifiedPaymentSummary(
    makeTransaction(),
    reference,
    "98765"
  );

  assert.deepEqual(payment, {
    status: "success",
    orderNumber: "654321",
    reference,
    amountCents: 2500,
    currency: "EGP",
    paidAt: "2026-10-29T09:01:00Z",
  });
});

test("keeps pending, failed, cancelled, and refunded states distinct", () => {
  assert.equal(
    getVerifiedPaymentSummary(
      makeTransaction({ pending: true, success: false }),
      reference,
      "98765"
    ).status,
    "pending"
  );
  assert.equal(
    getVerifiedPaymentSummary(
      makeTransaction({ success: false }),
      reference,
      "98765"
    ).status,
    "failed"
  );
  assert.equal(
    getVerifiedPaymentSummary(
      makeTransaction({ is_voided: true }),
      reference,
      "98765"
    ).status,
    "cancelled"
  );
  assert.equal(
    getVerifiedPaymentSummary(
      makeTransaction({ is_refunded: true }),
      reference,
      "98765"
    ).status,
    "refunded"
  );
});

test("rejects a transaction that does not match the Plume reference, amount, or integration", () => {
  assert.equal(
    getVerifiedPaymentSummary(
      makeTransaction(),
      "PLUME-1761782400000-other",
      "98765"
    ),
    null
  );
  assert.equal(
    getVerifiedPaymentSummary(
      makeTransaction({ amount_cents: 2501 }),
      reference,
      "98765"
    ),
    null
  );
  assert.equal(
    getVerifiedPaymentSummary(makeTransaction(), reference, "98766"),
    null
  );
});

test("does not use a browser success flag as proof of payment", async (t) => {
  const env = globalThis.process.env;
  const previousApiKey = env.PAYMOB_API_KEY;
  const previousIntegrationId = env.PAYMOB_INTEGRATION_ID;
  const previousFetch = globalThis.fetch;
  const requests = [];

  env.PAYMOB_API_KEY = "test-api-key-for-mock";
  env.PAYMOB_INTEGRATION_ID = "98765";
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    if (requests.length === 1) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ token: "mock-auth-token" }),
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => makeTransaction({ success: false }),
    };
  };

  t.after(() => {
    if (previousApiKey === undefined) delete env.PAYMOB_API_KEY;
    else env.PAYMOB_API_KEY = previousApiKey;
    if (previousIntegrationId === undefined) delete env.PAYMOB_INTEGRATION_ID;
    else env.PAYMOB_INTEGRATION_ID = previousIntegrationId;
    globalThis.fetch = previousFetch;
  });

  const req = {
    method: "POST",
    body: { reference, success: true, amountCents: 1 },
  };
  const res = makeResponse();
  await verifyPaymentHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, "failed");
  assert.equal(res.body.amountCents, 2500);
  assert.equal("email" in res.body, false);
  assert.match(requests[1].options.body, new RegExp(reference));
});

test("returns a neutral status when Paymob has no transaction for the reference", async (t) => {
  const env = globalThis.process.env;
  const previousApiKey = env.PAYMOB_API_KEY;
  const previousIntegrationId = env.PAYMOB_INTEGRATION_ID;
  const previousFetch = globalThis.fetch;
  let requestCount = 0;

  env.PAYMOB_API_KEY = "test-api-key-for-mock";
  env.PAYMOB_INTEGRATION_ID = "98765";
  globalThis.fetch = async () => {
    requestCount += 1;
    return requestCount === 1
      ? { ok: true, status: 200, json: async () => ({ token: "mock-auth-token" }) }
      : { ok: false, status: 404, json: async () => ({}) };
  };

  t.after(() => {
    if (previousApiKey === undefined) delete env.PAYMOB_API_KEY;
    else env.PAYMOB_API_KEY = previousApiKey;
    if (previousIntegrationId === undefined) delete env.PAYMOB_INTEGRATION_ID;
    else env.PAYMOB_INTEGRATION_ID = previousIntegrationId;
    globalThis.fetch = previousFetch;
  });

  const res = makeResponse();
  await verifyPaymentHandler({ method: "POST", body: { reference } }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { status: "not_found" });
});

test("reports provider network errors without marking payment successful", async (t) => {
  const env = globalThis.process.env;
  const previousApiKey = env.PAYMOB_API_KEY;
  const previousIntegrationId = env.PAYMOB_INTEGRATION_ID;
  const previousFetch = globalThis.fetch;

  env.PAYMOB_API_KEY = "test-api-key-for-mock";
  env.PAYMOB_INTEGRATION_ID = "98765";
  globalThis.fetch = async () => {
    throw new Error("mock network failure");
  };

  t.after(() => {
    if (previousApiKey === undefined) delete env.PAYMOB_API_KEY;
    else env.PAYMOB_API_KEY = previousApiKey;
    if (previousIntegrationId === undefined) delete env.PAYMOB_INTEGRATION_ID;
    else env.PAYMOB_INTEGRATION_ID = previousIntegrationId;
    globalThis.fetch = previousFetch;
  });

  const res = makeResponse();
  await verifyPaymentHandler({ method: "POST", body: { reference } }, res);

  assert.equal(res.statusCode, 502);
  assert.deepEqual(res.body, { error: "Payment provider error" });
});

test("rejects wallet payments because only card payments are supported", async (t) => {
  const env = globalThis.process.env;
  const names = [
    "PAYMOB_API_KEY",
    "PAYMOB_SECRET_KEY",
    "PAYMOB_PUBLIC_KEY",
    "PAYMOB_INTEGRATION_ID",
  ];
  const previous = Object.fromEntries(names.map((name) => [name, env[name]]));
  const previousFetch = globalThis.fetch;
  let requestCount = 0;

  env.PAYMOB_API_KEY = "test-api-key-for-mock";
  env.PAYMOB_SECRET_KEY = "test-secret-key-for-mock";
  env.PAYMOB_PUBLIC_KEY = "test-public-key-for-mock";
  env.PAYMOB_INTEGRATION_ID = "98765";
  globalThis.fetch = async () => {
    requestCount += 1;
    throw new Error("Unsupported payment methods must not reach Paymob");
  };

  t.after(() => {
    for (const name of names) {
      if (previous[name] === undefined) delete env[name];
      else env[name] = previous[name];
    }
    globalThis.fetch = previousFetch;
  });

  const res = makeResponse();
  await createPaymentHandler(
    { method: "POST", body: { paymentMethod: "wallet" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: "Payment method is not available" });
  assert.equal(requestCount, 0);
});
