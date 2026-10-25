<div align="center">

# PLUME

**A literary book-discovery experience inspired by the atmosphere of a Parisian bookstore.**

[Live demo](https://plume-cyan-mu.vercel.app) · [Screenshots](#-screenshots) · [Features](#-features) · [Getting started](#-getting-started)

<img src="https://skillicons.dev/icons?i=react,vite,tailwind,js,vercel" alt="Tech stack icons" />

</div>

<br>

Browse books by genre, search for titles and authors, and explore detailed pages for books and writers. PLUME is a frontend-only graduation project built at ITI. It uses public APIs for book and author data, and your wishlist and bag are saved in your browser.

> [!NOTE]
> PLUME is not a real store. See the [demo notice](#-demo-notice) below.

## 📸 Screenshots

| Home | Discover |
| :---: | :---: |
| ![PLUME home page](docs/screenshots/home.png) | ![Book discovery and search](docs/screenshots/discover.png) |
| A literary landing page with a curated selection of books. | Search books and authors, with suggestions and matching results. |

| Categories | Book details |
| :---: | :---: |
| ![Browse book categories](docs/screenshots/categories.png) | ![Book details page](docs/screenshots/book.png) |
| Browse genres through a visual collection. | A book's cover, author, description, and available actions. |

## ✨ Features

- **Search** for books by title or author, with an Authors section above the book results.
- **Categories** to browse books by genre and subject, including Classics.
- **Book details** page for every book.
- **Author pages** with a biography summary from Wikipedia and a list of the author's books.
- **Wishlist and bag**, saved in the browser with `localStorage`.
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

Requirements: [Node.js](https://nodejs.org/) and npm.

```bash
git clone https://github.com/Elwasify/PLUME.git
cd PLUME
npm install
npm run dev
```

Vite prints the local address in the terminal. Open it in your browser.

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

No API keys are required. The project reads no environment variables, so there is no `.env` file to create.

## ⚠️ Demo notice

- Prices are demo prices generated deterministically in the app. They are not real prices.
- The payment page is a preview. It does not send billing details, place orders, or take payment; Paymob is not connected yet.
- The newsletter form is a demo. It does not send any email; entries are saved only in your browser.

## 🌐 Deployment

PLUME is deployed on Vercel. The project includes a `vercel.json` with a single-page-app rewrite, so refreshing or opening an inner route directly loads the app.

## 📚 Credits

- **Books:** [Open Library](https://openlibrary.org/), through its public API with no key. Results and cover availability depend on the Open Library catalog. Book covers are loaded from Open Library.
- **Authors:** [Wikipedia](https://www.wikipedia.org/) summary and search APIs. Wikipedia text is available under [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/).
- **Kafka portrait** on the About page: [Franz Kafka, 1923](https://commons.wikimedia.org/wiki/File:Franz_Kafka,_1923.jpg) on Wikimedia Commons, public domain.

## 🧩 Known limitations

- The author page matches books by exact normalized author name, so authors whose names are stored with alternate spellings in Open Library may show fewer books.