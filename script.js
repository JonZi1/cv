// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');
const html = document.documentElement;

// Safe localStorage access (fails silently in private browsing)
const getTheme = () => {
    try { return localStorage.getItem('theme'); } catch { return null; }
};
const setTheme = (theme) => {
    try { localStorage.setItem('theme', theme); } catch {}
};

// Check for saved preference or system preference
const savedTheme = getTheme();
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
    html.setAttribute('data-theme', 'dark');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
}

themeToggle.addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';

    if (isDark) {
        html.removeAttribute('data-theme');
        setTheme('light');
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
    } else {
        html.setAttribute('data-theme', 'dark');
        setTheme('dark');
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
    }
});

// Download PDF — serves a pre-rendered PDF so the result is identical for
// every visitor and never depends on their browser's print dialog or extensions.
// The button can override the source path and download filename per-page via
// data-pdf and data-pdf-name attributes (used by the PM-flavoured variant).
document.getElementById('download-pdf').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const a = document.createElement('a');
    a.href = btn.dataset.pdf || 'cv.pdf';
    a.download = btn.dataset.pdfName || 'jon-zisi-cv.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
});

// Share button — reads the current page's <title> and meta description so each
// CV variant (index.html, pm.html) shares its own flavour automatically.
document.getElementById('share-btn').addEventListener('click', async () => {
    const metaDesc = document.querySelector('meta[name="description"]');
    const shareData = {
        title: document.title,
        text: metaDesc ? metaDesc.content : "Jon Zisi’s CV",
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            // User cancelled or share failed - ignore
        }
    } else {
        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        } catch (err) {
            // Fallback for older browsers
            prompt('Copy this link:', window.location.href);
        }
    }
});
