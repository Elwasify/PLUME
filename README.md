<div align="center">

# PLUME

**A literary book-discovery experience inspired by the atmosphere of a Parisian bookstore.**

[Live demo](https://plume-cyan-mu.vercel.app) · [Report an issue](https://github.com/Elwasify/PLUME/issues)

![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)

</div>

Browse books by genre, search for titles and authors, and explore detailed pages for books and writers. PLUME is a frontend-only graduation project built at ITI. It uses public APIs for book and author data, and your wishlist and bag are saved in your browser.

## Screenshots

| Home | Discover |
| :---: | :---: |
| ![PLUME home page](docs/screenshots/home.png) | ![Book discovery and search](docs/screenshots/discover.png) |
| A literary landing page with a curated selection of books. | Search books and authors, with suggestions and matching results. |

| Categories | Book details |
| :---: | :---: |
| ![Browse book categories](docs/screenshots/categories.png) | ![Book details page](docs/screenshots/book.png) |
| Browse genres through a visual collection. | A book's cover, author, description, and available actions. |

## Features

- **Search** for books by title or author, with an Authors section above the book results.
- **Categories** to browse books by genre and subject, including Classics.
- **Book details** page for every book.
- **Author pages** with a biography summary from Wikipedia and a list of the author's books.
- **Wishlist and bag**, saved in the browser with `localStorage`.
- **About** page and a custom **404** page.

## Demo notice

PLUME is not a real store.

- Prices are demo prices generated deterministically in the app. They are not real prices.
- The payment page is a preview. It does not send billing details, place orders, or take payment; Paymob is not connected yet.
- The newsletter form is a demo. It does not send any email; entries are saved only in your browser.

## Tech stack

- [React](https://react.dev/) and [Vite](https://vite.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Iconify](https://iconify.design/) (`@iconify/react`) with Lucide icons
- Native `fetch`, React Context, and `localStorage`

## Getting started

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

## Data sources

- **Books:** [Open Library](https://openlibrary.org/), through its public API with no key. Results and cover availability depend on the Open Library catalog.
- **Authors:** [Wikipedia](https://www.wikipedia.org/) summary and search APIs. Wikipedia text is available under [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/).

## Image credits

- Kafka portrait on the About page: [Franz Kafka, 1923](https://commons.wikimedia.org/wiki/File:Franz_Kafka,_1923.jpg) on Wikimedia Commons, public domain.
- Book covers are loaded from Open Library.

## Deployment

PLUME is deployed on Vercel. The project includes a `vercel.json` with a single-page-app rewrite, so refreshing or opening an inner route directly loads the app.

## Known limitations

- The author page matches books by exact normalized author name, so authors whose names are stored with alternate spellings in Open Library may show fewer books.

## Author

Built by [@Elwasify](https://github.com/Elwasify) as a graduation project at ITI.
