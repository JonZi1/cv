const { chromium } = require('playwright');
const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const variants = {
    data: {
        url: 'http://localhost:8000/index.html',
        output: 'cv.pdf',
        headline: 'Data Analyst | BI, SQL & Automation',
        pmBullets: 2,
        analystBullets: 4,
    },
    pm: {
        url: 'http://localhost:8000/pm.html',
        output: 'cv-pm.pdf',
        headline: 'Junior Product Manager | Product Operations, Data & Automation',
        pmBullets: 4,
        analystBullets: 2,
    },
};

const variantName = process.env.QA_VARIANT || 'data';
const variant = variants[variantName];
if (!variant) throw new Error(`Unknown QA_VARIANT: ${variantName}`);

const URL = process.env.QA_URL || variant.url;
const OUT = path.join(__dirname, process.env.QA_PDF_OUT || variant.output);
const normalise = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '');

const banned = [
    'Drawbridge',
    'Connect to a local folder',
    'Press C to make a comment',
    'Disco',
    'Data Analyst | AI Enthusiast',
    'Jan 2022 - Present',
];

(async () => {
    const failures = [];
    let browser;

    try {
        console.log(`generating ${OUT} from ${URL} (${variantName}) ...`);
        browser = await chromium.launch();
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(URL, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.emulateMedia({ media: 'print' });

        const domAudit = await page.evaluate(() => {
            const visible = element => {
                const style = getComputedStyle(element);
                return style.display !== 'none' && style.visibility !== 'hidden';
            };
            const textSelectors = [
                'h1', '.title', '.contact-bar', '.section-title', '.about-text',
                '.entry-title', '.entry-subtitle', '.entry-progression', '.entry-date',
                '.entry-details li', '.skill-category-title', '.skill-tag',
                '.education-line', '.languages-line',
            ];
            const text = [...document.querySelectorAll(textSelectors.join(','))]
                .filter(visible)
                .map(element => element.textContent.replace(/\s+/g, ' ').trim())
                .filter(Boolean);

            const fontRules = [
                { selector: '.about-text', minPt: 9 },
                { selector: '.entry-title', minPt: 9 },
                { selector: '.entry-subtitle', minPt: 9 },
                { selector: '.entry-progression', minPt: 9 },
                { selector: '.entry-date', minPt: 9 },
                { selector: '.entry-details li', minPt: 9 },
                { selector: '.education-line', minPt: 9 },
                { selector: '.contact-bar a', minPt: 8 },
                { selector: '.contact-bar .location', minPt: 8 },
                { selector: '.skill-category-title', minPt: 8 },
                { selector: '.skill-tag', minPt: 8 },
                { selector: '.languages-line', minPt: 8 },
            ];
            const fonts = fontRules.flatMap(rule => [...document.querySelectorAll(rule.selector)]
                .filter(visible)
                .map(element => ({
                    selector: rule.selector,
                    minPt: rule.minPt,
                    actualPt: Number.parseFloat(getComputedStyle(element).fontSize) * 0.75,
                    text: element.textContent.replace(/\s+/g, ' ').trim().slice(0, 60),
                })));

            return {
                text,
                fonts,
                headline: document.querySelector('.title')?.textContent.trim(),
                aiClaims: document.querySelectorAll('[data-ai-claim]').length,
                pmBullets: document.querySelectorAll('[data-employer="ergeon"][data-role="pm"] li').length,
                analystBullets: document.querySelectorAll('[data-employer="ergeon"][data-role="analyst"] li').length,
            };
        });

        if (domAudit.headline !== variant.headline) failures.push(`headline mismatch: ${domAudit.headline}`);
        if (domAudit.aiClaims !== 1) failures.push(`expected one AI claim marker, found ${domAudit.aiClaims}`);
        if (domAudit.pmBullets !== variant.pmBullets) failures.push(`PM bullets: expected ${variant.pmBullets}, found ${domAudit.pmBullets}`);
        if (domAudit.analystBullets !== variant.analystBullets) failures.push(`analyst bullets: expected ${variant.analystBullets}, found ${domAudit.analystBullets}`);
        for (const font of domAudit.fonts) {
            if (font.actualPt + 0.05 < font.minPt) {
                failures.push(`font below floor: ${font.selector} ${font.actualPt.toFixed(2)}pt < ${font.minPt}pt (${font.text})`);
            }
        }
        const fontSummary = [...new Set(domAudit.fonts.map(font => `${font.selector}=${font.actualPt.toFixed(1)}pt`))];
        console.log(`OK   print fonts: ${fontSummary.join(', ')}`);

        await page.pdf({ path: OUT, printBackground: true, preferCSSPageSize: true });
        await browser.close();
        browser = null;

        const bytes = fs.readFileSync(OUT);
        const original = bytes.toString('binary');
        const patched = original.replace(/(\/(?:Creation|Mod)Date\s*\(D:)\d{14}/g, '$1' + '20260101000000');
        if (patched.length !== bytes.length) failures.push(`metadata patch changed byte length: ${bytes.length} -> ${patched.length}`);
        else if (patched !== original) fs.writeFileSync(OUT, patched, 'binary');

        const stat = fs.statSync(OUT);
        if (stat.size < 10_000) failures.push(`PDF too small (${stat.size} bytes)`);
        else console.log(`OK   PDF generated: ${OUT} (${stat.size} bytes)`);

        const parser = new PDFParse({ data: fs.readFileSync(OUT) });
        const result = await parser.getText();
        await parser.destroy();
        const pages = result.pages || [];
        const fullText = result.text || '';
        const normalisedPdf = normalise(fullText);
        console.log(`OK   PDF parsed: ${pages.length} page(s), ${fullText.length} chars`);

        if (pages.length !== 1) failures.push(`expected exactly one page, found ${pages.length}`);
        for (const term of banned) {
            if (normalisedPdf.includes(normalise(term))) failures.push(`banned text in PDF: "${term}"`);
        }

        const jira = fullText.match(/\b(DA|SYS|ENG|APPS|CAD|CM|IT|PO|PROD)-\d+\b/);
        const internalEmail = fullText.match(/[A-Za-z0-9._%+-]+@ergeon\.com/i);
        if (jira) failures.push(`Jira reference in PDF: ${jira[0]}`);
        if (internalEmail) failures.push(`internal email in PDF: ${internalEmail[0]}`);

        for (const text of domAudit.text) {
            if (!normalisedPdf.includes(normalise(text))) failures.push(`DOM text missing from PDF: "${text}"`);
        }
        console.log(`OK   checked ${domAudit.text.length} visible content blocks against PDF text`);
    } catch (error) {
        failures.push(error.stack || error.message);
    } finally {
        if (browser) await browser.close();
    }

    console.log('---');
    if (failures.length) {
        for (const failure of failures) console.log(`FAIL ${failure}`);
        console.log(`${failures.length} failure(s)`);
        process.exit(1);
    }
    console.log(`all ${variantName} PDF QA checks passed`);
})();
