# Rift

**Rift** is a clean, predictable static site generator built in TypeScript. It helps you turn your content and templates into fast, modern websites—without the complexity of traditional web frameworks.

---

## Project Overview

Rift makes it easy to build static websites using familiar folder structures and simple configuration. Whether you're creating a blog, documentation, or a marketing site, Rift gives you the tools to organize your content, use layouts, and generate pages with minimal fuss.

---

## Key Features

- **Simple, Predictable Structure** – Organize your site with clear folders for content, layouts, and assets.
- **Flexible Templating** – Use Nunjucks and Markdown for powerful, readable templates.
- **Fast Builds** – Quickly generate static HTML files ready to deploy anywhere.
- **Live Reload & Dev Server** – Preview changes instantly as you work.
- **Asset Handling** – Easily include static files like images, CSS, and JS.
- **Pagination & Collections** – Built-in helpers for blogs, lists, and more.
- **TypeScript-Powered** – Enjoy type safety and modern JavaScript features.

---

## Getting Started

Create a new Rift project in just one step:

```sh
npm create rift@latest
```

This command will guide you through setting up a new site—no manual installs or extra steps required.

To start the development server:

```sh
npm run dev
```

To build your site for production:

```sh
npm run build
```

---

## Folder Structure

Rift uses a clear folder layout:

- **src/site/** – Your main site pages (Nunjucks, Markdown, etc.)
- **src/layouts/** – Reusable layouts for your pages (e.g., `layout.njk`)
- **src/partials/** – Small template snippets (navigation, footers, etc.)
- **src/content/** – Blog posts, articles, or other structured content
- **src/assets/** – Static files like images, CSS, and JavaScript

You can customize these folders in your config, but the defaults work for most projects.

---

## Example Use Cases

Rift is great for:

- Personal blogs and portfolios
- Documentation sites
- Marketing and landing pages
- Project websites
- Any site where you want speed, simplicity, and full control over your HTML

---

## Contributing

We welcome contributions! To get involved:

1. Fork this repository
2. Create a new branch for your feature or fix
3. Submit a pull request with a clear description

For questions or ideas, open an issue or join the discussion.

---

## License

MIT – see LICENSE for details.