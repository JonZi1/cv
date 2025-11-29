# Jon Zisi - Personal CV Website

A clean, minimal, and professional CV/portfolio website built with HTML and CSS.

**Live Site:** [jonzi1.github.io/cv](https://jonzi1.github.io/cv/)

## Project Structure

```
cv/
├── index.html      # Main CV page (all content lives here)
├── style.css       # Styling (colors, typography, layout)
├── assets/         # Images (profile photo, project screenshots)
├── .gitignore      # Files excluded from git
└── README.md       # This file
```

## How to Update Content

All CV content is in `index.html`. To update:

1. **Personal Info:** Edit the `<header>` section (name, title, contact links)
2. **About:** Edit the `<section>` with class `section-title` "About"
3. **Experience:** Add/edit `<div class="entry">` blocks in the Experience section
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

### Adding a New Skill

```html
<span class="skill-tag">New Skill</span>
```

## Styling Customization

Edit `style.css` to change:

- **Colors:** Modify CSS variables in `:root` at the top
- **Fonts:** Change the Google Fonts import and `font-family`
- **Spacing:** Adjust `padding` and `margin` values

### Color Variables

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

## Deployment

The site is automatically deployed via **GitHub Pages** from the `master` branch.

Any push to `master` will trigger a rebuild (takes ~1-2 minutes).

## Local Development

To preview changes locally, simply open `index.html` in a browser:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Or just open the file directly
open index.html
```

## Future Enhancements

- [ ] Add profile photo
- [ ] Add icons to contact links
- [ ] Populate Projects section with Streamlit dashboards
- [ ] Add dark mode toggle
- [ ] Add downloadable PDF version
- [ ] Add meta tags for social sharing (Open Graph)

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Flexbox, Grid
- **Google Fonts** - Inter font family
- **GitHub Pages** - Hosting

## License

This is a personal CV website. Feel free to use the structure as a template for your own CV.
