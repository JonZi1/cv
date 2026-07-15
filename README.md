# Jon Zisi - Personal CV Website

A clean, minimal, and professional CV/portfolio website built with HTML, CSS, and vanilla JavaScript.

**Live Site:** [jonzi1.github.io/cv](https://jonzi1.github.io/cv/)

## Features

- Dark mode toggle (respects system preference)
- Download as PDF
- Share button (native share on mobile, copy link on desktop)
- Self-hosted Inter font (no external dependencies)
- Responsive design (mobile, tablet, desktop)
- One-page A4 PDFs with automated content, pagination, and font-size checks
- Custom 404 page

## CV Variants

The repo serves **three** CV variants from the same styles, fonts, and assets:

- **`index.html`** — Data Analyst flavour with the headline **Data Analyst | BI, SQL & Automation**.
- **`pm.html`** — Junior Product Manager flavour with the headline **Junior Product Manager | Product Operations, Data & Automation**.
- **`analytics-engineer.html`** — Analytics Engineer flavour with the headline **Analytics Engineer | BigQuery, SQL & Airflow**.

Each page links to the other variants via a small banner that is hidden on print so it does not appear in the generated PDF.

## Project Structure

```
cv/
├── index.html          # Data Analyst CV (default)
├── pm.html             # Junior Product Manager CV (variant)
├── analytics-engineer.html # Analytics Engineer CV (variant)
├── cv.pdf              # Pre-rendered PDF for index.html
├── cv-pm.pdf           # Pre-rendered PDF for pm.html
├── cv-analytics-engineer.pdf # Pre-rendered PDF for analytics-engineer.html
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
├── qa-static.js        # Multi-variant content and structure checks
├── qa-pdf.js           # Multi-variant one-page PDF, font-floor, and content checks
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
npm run serve         # Start local dev server on port 8000
npm run qa            # Run static HTML/JS sanity checks
npm run qa-pdf        # Generate cv.pdf from index.html and run PDF sanity checks
npm run qa-pdf-data   # Explicit Data Analyst PDF command
npm run qa-pdf-pm     # Generate cv-pm.pdf from pm.html and run PDF sanity checks
npm run qa-pdf-analytics-engineer # Generate the Analytics Engineer PDF
npm run qa-pdf-all    # Generate and check all PDFs (requires server running)
npm run qa-all        # Run static QA and generate/check all PDFs
npm run crop-photo    # Process profile photo (requires sharp)
npm run test-header   # Screenshot header for testing (requires playwright)
```

The PDF scripts assume `npm run serve` is running on port 8000.

## How to Update Content

CV content lives in three HTML files: `index.html` (Data Analyst, default), `pm.html` (Junior Product Manager), and `analytics-engineer.html` (Analytics Engineer). They use the same semantic `<header>` / `<section>` / `<article class="entry">` structure. Update each variant separately for role-specific content, or update all three for shared content such as contact details, education, and languages.

To update:

1. **Personal Info:** Edit the `<header>` section (name, title, contact links)
2. **About:** Edit the `<section>` with "About" title
3. **Experience:** Add/edit `<div class="entry">` blocks
4. **Education:** Same structure as Experience
5. **Skills:** Edit `<span class="skill-tag">` elements
6. **Languages:** Edit skill tags in the Languages section

### Adding a New Job Entry

```html
<article class="entry" data-employer="example">
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
</article>
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
