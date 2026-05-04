const { chromium } = require('playwright');
const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const URL = process.env.QA_URL || 'http://localhost:8000/';
const OUT = path.join(__dirname, 'cv-clean.pdf');

const BANNED = [
    'Drawbridge',
    'Connect to a local folder',
    'Press C to make a comment',
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
    'Apr 2026',
    'Jan 2022',
    'Mar 2026',
    'Jon Zisi',
    '2026',
];

(async () => {
    const failures = [];

    // 1. Generate cv-clean.pdf via stock Playwright Chromium — no user data dir,
    //    no extensions, no host-installed Chrome profile, so any extension-injected
    //    overlay (e.g. Drawbridge / Disco) cannot reach the page.
    console.log(`generating ${OUT} from ${URL} ...`);
    const browser = await chromium.launch();
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({
        path: OUT,
        format: 'A4',
        printBackground: true,
        margin: { top: '0.4in', right: '0.5in', bottom: '0.4in', left: '0.5in' },
    });
    await browser.close();
    const stat = fs.statSync(OUT);
    if (stat.size < 10_000) failures.push(`PDF too small (${stat.size} bytes)`);
    else console.log(`OK   PDF generated: ${OUT} (${stat.size} bytes)`);

    // 2. Parse PDF bytes — this validates what the file actually contains, not what
    //    the DOM looked like at print emulation time.
    const parser = new PDFParse({ data: fs.readFileSync(OUT) });
    const result = await parser.getText();
    const pages = result.pages || [];
    const fullText = result.text || '';
    console.log(`OK   PDF parsed: ${pages.length} page(s), ${fullText.length} chars`);

    // 3. No banned term may appear anywhere in the PDF. Normalise to defeat
    //    PDF-extraction artifacts that could splice/drop characters.
    const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const normFull = norm(fullText);
    for (const term of BANNED) {
        if (normFull.includes(norm(term))) failures.push(`BANNED in PDF: "${term}"`);
        else console.log(`OK   no "${term}" anywhere in PDF`);
    }

    // 4. Page 2 must start with CV content, not an external panel.
    if (pages.length >= 2) {
        const p2 = (pages[1].text || '').trim();
        const p2start = p2.slice(0, 200);
        const p2startNorm = norm(p2start);
        let cleanStart = true;
        for (const term of BANNED) {
            if (p2startNorm.includes(norm(term))) {
                failures.push(`page 2 starts with banned content: "${term}"`);
                cleanStart = false;
            }
        }
        if (cleanStart) console.log(`OK   page 2 clean — first 60 chars: ${JSON.stringify(p2start.slice(0, 60))}`);
    } else {
        console.log(`note PDF has only ${pages.length} page(s) — page-2 check skipped`);
    }

    // 5. Required content. Reuses normFull from above.
    for (const term of REQUIRED_PROJECTS) {
        if (!normFull.includes(norm(term))) failures.push(`MISSING project: "${term}"`);
        else console.log(`OK   project visible: "${term}"`);
    }
    for (const term of REQUIRED_OTHER) {
        if (!normFull.includes(norm(term))) failures.push(`MISSING required text: "${term}"`);
        else console.log(`OK   present: "${term}"`);
    }

    console.log('---');
    if (failures.length) {
        for (const f of failures) console.log(`FAIL ${f}`);
        console.log(`${failures.length} failure(s)`);
        process.exit(1);
    } else {
        console.log('all PDF QA checks passed');
    }
})();
