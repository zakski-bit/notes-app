# Notes App — Vanilla Web Components & RESTful API Architecture

Modular, framework-free note management web application built strictly with **Vanilla JavaScript (ES6+)**, official **W3C Web Components** (Custom Elements & Shadow DOM), and bundled using **Webpack 5**.

[![Live Demo](https://img.shields.io/badge/Netlify-Live%20Demo-00C7B7?style=flat&logo=netlify)](https://notes-appz.netlify.app/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B%20Vanilla-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Components](https://img.shields.io/badge/W3C-Web%20Components-2A62C8?style=flat)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
[![Webpack](https://img.shields.io/badge/Webpack-5.x-8DD6F9?style=flat&logo=webpack)](https://webpack.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Live Deployment

- **Production URL**: [https://notes-appz.netlify.app/](https://notes-appz.netlify.app/)

## Architectural Design

The application avoids third-party UI framework dependencies by adopting native browser standards for component isolation and encapsulation:

```
src/
├── scripts/
│   ├── components/            # Isolated W3C Custom Elements
│   │   ├── app-bar.js         # Navigation header & theme controls
│   │   ├── note-input.js      # Note creation form with live validation
│   │   ├── note-item.js       # Individual note card with action handlers
│   │   ├── note-list.js       # Responsive CSS Grid container
│   │   └── loading-indicator.js # Asynchronous state spinner
│   ├── data/
│   │   └── api.js             # REST API communication client (Fetch API)
│   └── index.js               # Application bootstrap & component registration
├── styles/
│   └── style.css              # Global styles, variables & CSS Grid definitions
└── index.html                 # HTML template host
```

## Key Capabilities

- **W3C Custom Elements**: Reusable components (`<app-bar>`, `<note-input>`, `<note-item>`, `<note-list>`, `<loading-indicator>`) encapsulated via the Shadow DOM to avoid global CSS bleeding.
- **RESTful API Integration**: Asynchronous data synchronization with remote endpoints (`/notes`, `/notes/archived`), managing active notes, archiving, unarchiving, and permanent deletion.
- **Real-Time Client Validation**: Character counter indicators and constraint validation on title and note body fields before dispatching network payloads.
- **Responsive Layout**: Fluid CSS Grid system adapting from single-column mobile views to multi-column desktop layouts.
- **Modular Webpack Tooling**: Segmented build configurations (`webpack.common.js`, `webpack.dev.js`, `webpack.prod.js`) implementing Babel transpilation, CSS extraction, asset optimization, and development hot-reloading.

## Quickstart

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/zakski-bit/notes-app.git
   cd notes-app
   npm install
   ```

2. Start local development server:
   ```bash
   npm run start-dev
   ```

3. Build production bundle:
   ```bash
   npm run build
   ```

## License

MIT License. See [LICENSE](LICENSE) for details.
