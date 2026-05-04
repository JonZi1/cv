const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = process.env.QA_URL || 'http://localhost:8000/';
const OUT = path.join(__dirname, 'cv.pdf');

const BANNED = [
    'Drawbridge',
    'Connect to a local folder',
    'Disco',
    'Data Analyst | AI Enthusiast',
    'Jan 2022 - Present',
    'catalogue',
    'Catalogue',
    'standardisation',
];

const REQUIRED_PROJECTS = [
    'Product & Pricing Workflow Improvements',
    'Operations & Backlog Dashboards',
    'Material Catalog & Pricing Analysis',
    'AI-Assisted Internal Tooling',
];

const REQUIRED_OTHER = [
    'Junior Product Manager',
    'Data / Business Analyst',
    'Apr 2026 - Present',
    'Jan 2022 - Mar 2026',
    '© 2026 Jon Zisi',
];

(async () => {
    const failures = [];
    const browser = await chromium.launch();
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });

    // Emulate print, then extract visible text — this is what the PDF will contain.
    await page.emulateMedia({ media: 'print' });
    const printText = await page.evaluate(() => document.body.innerText);

    for (const term of BANNED) {
        if (printText.includes(term)) failures.push(`banned term present in print output: "${term}"`);
        else console.log(`OK   no "${term}"`);
    }
    for (const term of REQUIRED_PROJECTS) {
        if (!printText.includes(term)) failures.push(`missing project in print output: "${term}"`);
        else console.log(`OK   project visible: "${term}"`);
    }
    for (const term of REQUIRED_OTHER) {
        if (!printText.includes(term)) failures.push(`missing required text in print output: "${term}"`);
        else console.log(`OK   present: "${term}"`);
    }

    // JSON-LD validity (separate from print content but bundled here for one-shot QA)
    const ldOk = await page.evaluate(() => {
        const el = document.querySelector('script[type="application/ld+json"]');
        if (!el) return { ok: false, msg: 'no JSON-LD block' };
        try { JSON.parse(el.textContent); return { ok: true }; }
        catch (e) { return { ok: false, msg: e.message }; }
    });
    ldOk.ok ? console.log('OK   JSON-LD valid') : failures.push(`JSON-LD invalid: ${ldOk.msg}`);

    // Generate the actual PDF
    await page.pdf({
        path: OUT,
        format: 'A4',
        printBackground: true,
        margin: { top: '0.4in', right: '0.5in', bottom: '0.4in', left: '0.5in' },
    });
    const stat = fs.statSync(OUT);
    if (stat.size < 10_000) failures.push(`PDF too small (${stat.size} bytes)`);
    else console.log(`OK   PDF generated: ${OUT} (${stat.size} bytes)`);

    await browser.close();

    console.log('---');
    if (failures.length) {
        for (const f of failures) console.log(`FAIL ${f}`);
        console.log(`${failures.length} failure(s)`);
        process.exit(1);
    } else {
        console.log('all PDF QA checks passed');
    }
})();
