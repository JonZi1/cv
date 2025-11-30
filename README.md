# Jon Zisi - Personal CV Website

A clean, minimal, and professional CV/portfolio website built with HTML, CSS, and vanilla JavaScript.

**Live Site:** [jonzi1.github.io/cv](https://jonzi1.github.io/cv/)

## Features

- Dark mode toggle (respects system preference)
- Download as PDF
- Share button (native share on mobile, copy link on desktop)
- Self-hosted Inter font (no external dependencies)
- Responsive design (mobile, tablet, desktop)
- Print-optimized styles
- Custom 404 page

## Project Structure

```
cv/
├── index.html          # Main CV page
├── style.css           # Styling (variables, layout, dark mode, print)
├── script.js           # Theme toggle, PDF download, share functionality
├── 404.html            # Custom error page
├── favicon.svg         # Browser tab icon
├── apple-touch-icon.png # iOS home screen icon
├── fonts/              # Self-hosted Inter font (woff2)
├── assets/
│   ├── photo-square.webp  # Profile photo (optimized)
│   └── photo-square.png   # Profile photo (fallback)
├── package.json        # npm scripts
├── crop-photo.js       # Utility to crop profile photo
├── test-header.js      # Visual testing script
└── README.md           # This file
```

## Local Development

```bash
# Using npm script
npm run serve

# Or using Python directly
python3 -m http.server 8000
```

Then open http://localhost:8000

## npm Scripts

```bash
npm run serve        # Start local dev server on port 8000
npm run crop-photo   # Process profile photo (requires sharp)
npm run test-header  # Screenshot header for testing (requires playwright)
```

## How to Update Content

All CV content is in `index.html`. To update:

1. **Personal Info:** Edit the `<header>` section (name, title, contact links)
2. **About:** Edit the `<section>` with "About" title
3. **Experience:** Add/edit `<div class="entry">` blocks
4. **Education:** Same structure as Experience
5. **Skills:** Edit `<span class="skill-tag">` elements
6. **Languages:** Edit skill tags in the Languages section

### Adding a New Job Entry

```html
<div class="entry">
    <div class="entry-header">
        <div>
            <h3 class="entry-title">Job Title</h3>
            <p class="entry-subtitle">Company Name</p>
        </div>
        <span class="entry-date">Start - End</span>
    </div>
    <ul class="entry-details">
        <li>Achievement or responsibility</li>
        <li>Another bullet point</li>
    </ul>
</div>
```

## Styling Customization

Edit `style.css` to change colors, fonts, or spacing. CSS variables are defined in `:root`:

```css
:root {
    --color-bg: #fafafa;           /* Page background */
    --color-surface: #ffffff;       /* Card background */
    --color-text: #1a1a2e;          /* Main text */
    --color-text-muted: #64748b;    /* Secondary text */
    --color-accent: #2563eb;        /* Blue accent */
    --color-accent-light: #eff6ff;  /* Light blue for tags */
}
```

Dark mode overrides these in `[data-theme="dark"]`.

## Deployment

The site is automatically deployed via **GitHub Pages** from the `master` branch.

Any push to `master` will trigger a rebuild (takes ~1-2 minutes).

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Flexbox, Grid, print styles
- **JavaScript** - Vanilla JS (no frameworks)
- **Inter Font** - Self-hosted (woff2)
- **GitHub Pages** - Hosting

## License

This is a personal CV website. Feel free to use the structure as a template for your own CV.
