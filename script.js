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

// Download PDF
document.getElementById('download-pdf').addEventListener('click', () => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isIOS) {
        alert('On iPhone/iPad:\n\n1. Tap Share button (□↑)\n2. Tap "Print"\n3. Pinch outward on preview to save as PDF');
    } else if (isAndroid) {
        alert('Tip: Select "Save as PDF" as the printer in the next dialog.');
        window.print();
    } else {
        alert('Tip: In print dialog, go to "More settings" and disable "Headers and footers" for a cleaner PDF.');
        window.print();
    }
});
