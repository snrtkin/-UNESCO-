# Okayama UNESCO Web

This repository contains a static frontend website for the Okayama UNESCO Association and a backend scaffold that is not implemented yet.

## Project Status

- Frontend: Implemented and viewable in browser
- Backend: Folder structure exists, but server/config/routes/models are currently empty

## Folder Structure

```text
hackathon-unesco-web/
  BACK_END/
    Server.js              # empty
    Config/
      db.js                # empty
    Model/
      user.js              # empty
    Routes/
      auth.js              # empty
      data.js              # empty

  FRONT_END/
    index.html             # home page
    images/
      1.png
      logo.png
      okayama.jpg
      aisatsu-shachou.jpg
      aisatsu-title.avif
    pages/
      volunteer.html
      aisatsu.html
    script/
      index.js
      volunteer.js
      aisatsu.js
    style/
      style.css
      volunteer.css
      aisatsu.css
```

## Frontend Pages

- `FRONT_END/index.html`
  - Main landing page
  - Sidebar menu
  - Hero animation, parallax, particles, counters

- `FRONT_END/pages/aisatsu.html`
  - Chairperson greeting page (会長挨拶)
  - Uses `../style/aisatsu.css` and `../script/aisatsu.js`

- `FRONT_END/pages/volunteer.html`
  - Volunteer application page
  - Uses `../style/volunteer.css` and `../script/volunteer.js`

## Scripts Overview

- `FRONT_END/script/index.js`
  - Custom cursor behavior
  - Hero parallax and particles
  - Sidebar open/close logic
  - Reveal observer and animated stats counters

- `FRONT_END/script/volunteer.js`
  - Sticky nav behavior
  - Form focus/fill UX states
  - Client-side validation and simulated async submit
  - Reveal animations on scroll

- `FRONT_END/script/aisatsu.js`
  - Page-specific script placeholder (currently minimal)

## How To Run

Because this is a static frontend, you can run it directly with a simple local server.

### Option 1: VS Code Live Server

1. Open the workspace in VS Code
2. Open `FRONT_END/index.html`
3. Start Live Server

### Option 2: Python simple server

From repository root:

```bash
cd FRONT_END
python -m http.server 5500
```

Open:

- `http://localhost:5500/index.html`

## Navigation Notes

- Home menu links to chairperson greeting page:
  - `pages/aisatsu.html`
- `volunteer.html` exists as a standalone page and can be linked from menu/buttons as needed.

## Backend Notes

`BACK_END` is a scaffold only at the moment. To make backend functional, implement:

- Express app setup in `Server.js`
- Database connection in `Config/db.js`
- Route handlers in `Routes/auth.js` and `Routes/data.js`
- Mongoose/ORM model in `Model/user.js`

## Suggested Next Steps

1. Connect the volunteer form to a real backend endpoint.
2. Add missing page-to-page links (for example from home sections to volunteer page).
3. Implement backend API and environment configuration.
4. Add deployment documentation (Vercel/Netlify for frontend, Render/Railway for backend).
