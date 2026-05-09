const fs = require('fs');
const path = require('path');

const INDEX = path.join(__dirname, 'index.html');
const SCRIPT = path.join(__dirname, 'script.js');

const html = fs.readFileSync(INDEX, 'utf8');
const js = fs.readFileSync(SCRIPT, 'utf8');

const checks = [];
const check = (name, pass, detail) => checks.push({ name, pass, detail });

// JSON-LD valid
const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!ldMatch) {
    check('JSON-LD block present', false, 'no <script type="application/ld+json"> found');
} else {
    try {
        JSON.parse(ldMatch[1]);
        check('JSON-LD valid', true);
    } catch (e) {
        check('JSON-LD valid', false, e.message);
    }
}

// index.html content checks
check('no "Data Analyst | AI Enthusiast"', !html.includes('Data Analyst | AI Enthusiast'));
check('no "Jan 2022 - Present"', !html.includes('Jan 2022 - Present'));
check('footer contains 2026', /&copy;\s*2026\s+Jon Zisi/.test(html));
check('title contains "Jon Zisi | Senior Data Analyst"', /<title>[^<]*Jon Zisi \| Senior Data Analyst[^<]*<\/title>/.test(html));

// script.js shareData should be dynamic (read from document.title / meta) so
// pm.html and index.html each share their own flavour. Reject hard-coded titles
// that would lock both pages into one variant.
check('script.js shareData reads document.title', js.includes('title: document.title'));
check('script.js shareData reads meta description', js.includes('meta[name="description"]'));
check('script.js shareData not hard-coded "Jon Zisi | Senior Data Analyst"', !js.includes("'Jon Zisi | Senior Data Analyst'") && !js.includes('"Jon Zisi | Senior Data Analyst"'));
check('script.js shareData not "Jon Zisi | Junior Product Manager"', !js.includes("'Jon Zisi | Junior Product Manager'") && !js.includes('"Jon Zisi | Junior Product Manager"'));
check('script.js shareData not "Jon Zisi | Data Analyst"', !js.includes("'Jon Zisi | Data Analyst'") && !js.includes('"Jon Zisi | Data Analyst"'));

// British catalog spellings absent
const banned = ['catalogue', 'Catalogue', 'standardisation'];
for (const term of banned) {
    check(`no "${term}"`, !html.includes(term) && !js.includes(term));
}

// PDF-contamination terms must not appear in source
const contam = ['Drawbridge', 'Connect to a local folder', 'Disco'];
for (const term of contam) {
    check(`no "${term}" in source`, !html.includes(term) && !js.includes(term));
}

// Jira IDs: <PROJECT>-<digits>
const jiraRe = /\b(DA|SYS|ENG|APPS|CAD|CM|IT)-\d+\b/;
const jiraInHtml = html.match(jiraRe);
const jiraInJs = js.match(jiraRe);
check('no Jira ticket references in index.html', !jiraInHtml, jiraInHtml && jiraInHtml[0]);
check('no Jira ticket references in script.js', !jiraInJs, jiraInJs && jiraInJs[0]);

// Internal Ergeon emails (anything @ergeon.com)
const ergeonEmailRe = /[A-Za-z0-9._%+-]+@ergeon\.com/i;
const emailInHtml = html.match(ergeonEmailRe);
const emailInJs = js.match(ergeonEmailRe);
check('no @ergeon.com emails in index.html', !emailInHtml, emailInHtml && emailInHtml[0]);
check('no @ergeon.com emails in script.js', !emailInJs, emailInJs && emailInJs[0]);

// Report
let failed = 0;
for (const c of checks) {
    const tag = c.pass ? 'OK  ' : 'FAIL';
    const detail = c.pass ? '' : ` — ${c.detail || ''}`;
    console.log(`${tag} ${c.name}${detail}`);
    if (!c.pass) failed++;
}
console.log(`---\n${checks.length - failed}/${checks.length} passed`);
process.exit(failed === 0 ? 0 : 1);
