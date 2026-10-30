<div align="center">

# PLUME

**A literary book-discovery experience inspired by the atmosphere of a Parisian bookstore.**

[Live demo](https://plume-cyan-mu.vercel.app) | [Features](#features) | [Tech stack](#tech-stack) | [Test payment](#test-payment) | [Getting started](#getting-started)

<img src="https://skillicons.dev/icons?i=react,vite,tailwind,js,vercel" alt="Tech stack: React, Vite, Tailwind CSS, JavaScript, Vercel" />

</div>

<!-- Add a screenshot or GIF here, for example:
![PLUME screenshot](./docs/screenshot.png)
-->

> **Demo notice:** Payments run in Paymob test mode. No real money is charged, so please do not enter real card details.

## Overview

PLUME is an online bookstore built as a React training graduation project at ITI. Browse books, explore authors, save your favorites, and check out in EGP with Paymob using a bank card.

## Features

**Discover**

- **Search** for books by title or author, with authors listed above the book results. Search uses a bundled catalog and falls back to Open Library when it finds fewer than 6 local matches.
- **Categories** for browsing books by genre and subject, including Classics.
- **Book details** page for every book.
- **Author pages** with a biography summary from Wikipedia and a list of the author's books.

**Shop**

- **Wishlist and bag**, saved in the browser with `localStorage`.
- **Checkout** with Paymob card payments embedded in the payment page, followed by a payment result page. Bank card is the only supported payment method.

**Extras**

- **About** page and a custom **404** page.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | [React](https://react.dev/) and [Vite](https://vite.dev/) |
| Routing | [React Router](https://reactrouter.com/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4 |
| Icons | [Iconify](https://iconify.design/) (`@iconify/react`) with Lucide icons |
| State and storage | React Context and `localStorage` |
| Data | Native `fetch`, [Open Library](https://openlibrary.org/) and [Wikipedia](https://www.wikipedia.org/) APIs |
| Payments | [Paymob](https://paymob.com/) Intention API and card checkout |
| Backend and deployment | [Vercel](https://vercel.com/) Functions and hosting |

## Test payment

To try the checkout on the live demo, add a book to the bag and pay by bank card using the test details below.

### Bank card

| Field | Value |
| --- | --- |
| Card number | `5123450000000008` |
| Expiry | `01/39` |
| CVV | `123` |
| Name | `TEST CARD` |

## Project structure

```text
api/                Vercel Functions (payment creation and cart validation)
docs/               Project documentation, including payment setup
src/components/     Reusable UI components
src/context/        Shop state (bag and wishlist)
src/data/           Bundled book catalog and pricing
src/hooks/          Custom React hooks
src/pages/          Route-level pages
```

## Getting started

**Requirements:** [Node.js](https://nodejs.org/) and npm.

```bash
git clone https://github.com/Elwasify/PLUME.git
cd PLUME
npm install
npm run dev
```

Vite prints the local address in the terminal.

> **Note:** `npm run dev` starts only the Vite frontend, so the Vercel Functions in `api/` (including payment creation) are not available. To test checkout locally, install the [Vercel CLI](https://vercel.com/docs/cli), create a `.env.local` file with the variables described in [`docs/payments.md`](./docs/payments.md), and run:
>
> ```bash
> npm run dev:vercel
> ```

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server (frontend only) |
| `npm run dev:vercel` | Start the app together with the Vercel Functions, required to test payments locally |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Test book search and payment flows |

## Deployment

PLUME is deployed on Vercel. The project includes Vercel Functions in `api/` and a single-page-app rewrite in `vercel.json`. The environment variables described in [`docs/payments.md`](./docs/payments.md) must be added to every Vercel environment you use (Development, Preview and Production). Redeploy after changing them.

## Credits

- **Books:** [Open Library](https://openlibrary.org/). Search runs on a bundled catalog built from Open Library data and falls back to the public API, while browsing and book details use the public API with no key. Book covers are loaded from Open Library.
- **Authors:** [Wikipedia](https://www.wikipedia.org/) summary and search APIs. Wikipedia text is available under [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/).
- **Kafka portrait** on the About page: [Franz Kafka, 1923](https://commons.wikimedia.org/wiki/File:Franz_Kafka,_1923.jpg) on Wikimedia Commons, public domain.
- **Payments:** [Paymob](https://paymob.com/) test mode for bank card.

## Known limitations

- The author page matches books by exact normalized author name, so authors whose names are stored with alternate spellings in Open Library may show fewer books.
- Only bank card payments are supported. Mobile wallets are not available.