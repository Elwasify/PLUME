# PLUME

PLUME is a French-inspired literary library for discovering books and keeping a personal wishlist and shopping bag in the browser.

## Features

- Search and browse books by title, author, subject, and category.
- Open book and author detail pages from search results.
- Save books to a wishlist and shopping bag, with data stored in `localStorage`.
- Adjust bag quantities and see demo prices in a checkout preview.
- Use the site on desktop, tablet, or mobile screens.

PLUME is a frontend portfolio project. Checkout and newsletter forms are demonstrations; they do not place orders, take payment, or send email.

## Technology

- React and Vite
- React Router
- Tailwind CSS v4
- Iconify with Lucide icons
- Native `fetch`, React Context, and `localStorage`

## Getting started

Install Node.js, then open the project folder in a terminal and install its dependencies:

```bash
npm ci
```

Start the local development server:

```bash
npm run dev
```

Vite prints the local address in the terminal. Open that address in a browser.

## Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Book data and images

Book search, metadata, and catalog covers come from [Open Library](https://openlibrary.org/). Results and cover availability depend on its catalog. The homepage selection also uses local cover artwork. Some books show clearly marked demo prices because this project has no sales backend.

The Kafka portrait on the About page is [“Franz Kafka, 1923” on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Franz_Kafka,_1923.jpg), credited there to an unknown photographer and marked public domain.

## Deployment

The project includes a Vercel rewrite so direct visits and refreshes on React Router paths load the app. No production deployment URL is listed because deployment has not been verified.
