# PLUME payment setup

## Current payment flow

The checkout sends book IDs and quantities to `api/create-payment.js`. The server validates the cart against the book price table and creates a Paymob Intention in EGP for the configured card integration. Payment details stay in Paymob's form.

After Paymob returns the customer to `/payment-result`, the page ignores the `success` and `pending` URL values. It asks `api/verify-payment.js` to look up the server-issued `PLUME-...` reference with Paymob's Transaction Inquiry API. The page shows success and clears the bag only when the returned transaction matches that reference, the configured card integration ID, the order amount, and EGP. The server response contains payment details only; the name and shipping address shown on the success page are the values retained in that browser session.

The project does not have an order database. Paymob's order record is the source for the verified amount, order number, status, and payment date. If the browser session loses the payment reference, the page cannot safely associate the return with that checkout.

## Server environment

Keep these values in Vercel Function environment variables and in the local Vercel development environment. Do not add them as `VITE_` variables.

| Variable | Purpose |
| --- | --- |
| `PAYMOB_API_KEY` | Authenticates the server-side transaction inquiry request |
| `PAYMOB_SECRET_KEY` | Creates Paymob Intentions |
| `PAYMOB_PUBLIC_KEY` | Builds Paymob's checkout URL |
| `PAYMOB_INTEGRATION_ID` | The enabled card integration ID |

The API key, secret key, public key, and Integration ID must belong to the same Paymob account and mode. Configure Development, Preview, and Production separately in Vercel. Never paste the values into source files or chat.

`npm run dev` starts Vite only. Use `vercel dev` to exercise the `/api` functions locally, with test-mode credentials. The payment code must not be tested against live credentials during development.

## Validation commands

Run:

```bash
npm run build
npm run lint
npm run test
```

These checks use mocked payment responses and do not create real Paymob transactions or send email.
