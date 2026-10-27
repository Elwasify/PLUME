# PLUME

A literary book-discovery experience inspired by the atmosphere of a Parisian bookstore.

[Live demo](https://plume-cyan-mu.vercel.app) | [Features](#-features) | [Tech stack](#️-tech-stack) | [Getting started](#-getting-started)

<img src="https://skillicons.dev/icons?i=react,vite,tailwind,js,vercel" alt="Tech stack: React, Vite, Tailwind CSS, JavaScript, Vercel" />

## Overview

PLUME lets users browse books by genre, search for titles and authors, and explore detailed pages for books and writers. It is a frontend-only graduation project built at ITI. Book and author data come from public APIs, and the wishlist and bag are persisted in the browser.

> **Note:** PLUME is not a real store. See the [Demo notice](#️-demo-notice) below.

## ✨ Features

- **Search** for books by title or author, with an Authors section displayed above the book results.
- **Categories** for browsing books by genre and subject, including Classics.
- **Book details** page for every book.
- **Author pages** with a biography summary from Wikipedia and a list of the author's books.
- **Wishlist and bag**, persisted in the browser with `localStorage`.
- **About** page and a custom **404** page.

## 🛠️ Tech stack

| Area | Tools |
| --- | --- |
| Framework | [React](https://react.dev/) and [Vite](https://vite.dev/) |
| Routing | [React Router](https://reactrouter.com/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4 |
| Icons | [Iconify](https://iconify.design/) (`@iconify/react`) with Lucide icons |
| State and storage | React Context and `localStorage` |
| Data | Native `fetch`, [Open Library](https://openlibrary.org/) and [Wikipedia](https://www.wikipedia.org/) APIs |
| Deployment | [Vercel](https://vercel.com/) |

## 🚀 Getting started

**Requirements:** [Node.js](https://nodejs.org/) and npm.

```bash
git clone https://github.com/Elwasify/PLUME.git
cd PLUME
npm install
npm run dev
```

Vite prints the local address in the terminal. Open it in your browser.

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

No API keys are required. The project reads no environment variables, so there is no `.env` file to create.

## ⚠️ Demo notice

- Prices are demo prices generated deterministically in the app. They are not real prices.
- The payment page is a preview. It does not send billing details, place orders, or take payment. Paymob is not connected yet.
- The newsletter form is a demo. It does not send any email; entries are saved only in the browser.

## 🌐 Deployment

PLUME is deployed on Vercel. The project includes a `vercel.json` with a single-page-app rewrite, so refreshing or opening an inner route directly loads the app correctly.

## 📚 Credits

- **Books:** [Open Library](https://openlibrary.org/). Search runs on a bundled catalog built from Open Library data, while browsing and book details use its public API with no key. Results and cover availability depend on the Open Library catalog. Book covers are loaded from Open Library.
- **Authors:** [Wikipedia](https://www.wikipedia.org/) summary and search APIs. Wikipedia text is available under [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/).
- **Kafka portrait** on the About page: [Franz Kafka, 1923](https://commons.wikimedia.org/wiki/File:Franz_Kafka,_1923.jpg) on Wikimedia Commons, public domain.

## 🧩 Known limitations

- The author page matches books by exact normalized author name, so authors whose names are stored with alternate spellings in Open Library may show fewer books.