const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SCRIPT = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');

const variants = [
    {
        name: 'data',
        file: 'index.html',
        title: 'Jon Zisi | Data Analyst',
        headline: 'Data Analyst | BI, SQL & Automation',
        jobTitle: 'Data Analyst',
        alt: 'Jon Zisi - Data Analyst based in Athens, Greece',
        pdf: 'cv.pdf',
        pdfName: 'jon-zisi-cv-data-analyst.pdf',
        pmBullets: 2,
        analystBullets: 4,
    },
    {
        name: 'pm',
        file: 'pm.html',
        title: 'Jon Zisi | Junior Product Manager',
        headline: 'Junior Product Manager | Product Operations, Data & Automation',
        jobTitle: 'Junior Product Manager',
        alt: 'Jon Zisi - Junior Product Manager based in Athens, Greece',
        pdf: 'cv-pm.pdf',
        pdfName: 'jon-zisi-cv-product-manager.pdf',
        pmBullets: 4,
        analystBullets: 2,
    },
    {
        name: 'analytics-engineer',
        file: 'analytics-engineer.html',
        title: 'Jon Zisi | Analytics Engineer',
        headline: 'Analytics Engineer | BigQuery, SQL & Airflow',
        jobTitle: 'Analytics Engineer',
        alt: 'Jon Zisi - Analytics Engineer based in Athens, Greece',
        pdf: 'cv-analytics-engineer.pdf',
        pdfName: 'jon-zisi-cv-analytics-engineer.pdf',
        pmBullets: 2,
        analystBullets: 4,
    },
];

const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass, detail });
const decode = value => value
    .replace(/&amp;/g, '&')
    .replace(/&copy;/g, '©')
    .replace(/&middot;/g, '·')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function section(html, id) {
    const match = html.match(new RegExp(`<section[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/section>`));
    return match ? match[1] : '';
}

function article(html, employer, role = null) {
    const rolePart = role ? `(?=[^>]*data-role=["']${role}["'])` : '';
    const re = new RegExp(`<article${rolePart}(?=[^>]*data-employer=["']${employer}["'])[^>]*>([\\s\\S]*?)<\\/article>`);
    const match = html.match(re);
    return match ? match[1] : '';
}

function count(html, re) {
    return (html.match(re) || []).length;
}

for (const variant of variants) {
    const html = fs.readFileSync(path.join(ROOT, variant.file), 'utf8');
    const prefix = `${variant.name}:`;

    const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    let ld = null;
    try {
        ld = ldMatch ? JSON.parse(ldMatch[1]) : null;
        check(`${prefix} JSON-LD valid`, Boolean(ld));
    } catch (error) {
        check(`${prefix} JSON-LD valid`, false, error.message);
    }

    check(`${prefix} document title`, html.includes(`<title>${variant.title}</title>`), variant.title);
    check(`${prefix} exact headline`, decode((html.match(/<p class="title">([\s\S]*?)<\/p>/) || [,''])[1]) === variant.headline, variant.headline);
    check(`${prefix} JSON-LD job title`, ld?.jobTitle === variant.jobTitle, ld?.jobTitle);
    check(`${prefix} profile photo alt`, html.includes(`alt="${variant.alt}"`), variant.alt);

    const description = (html.match(/<meta name="description" content="([^"]+)"/) || [,''])[1];
    check(`${prefix} meta description names target role`, description.includes(variant.jobTitle), description);
    const ogDescription = (html.match(/<meta property="og:description" content="([^"]+)"/) || [,''])[1];
    const twitterDescription = (html.match(/<meta name="twitter:description" content="([^"]+)"/) || [,''])[1];
    check(`${prefix} Open Graph description names target role`, ogDescription.includes(variant.jobTitle), ogDescription);
    check(`${prefix} Twitter description names target role`, twitterDescription.includes(variant.jobTitle), twitterDescription);

    check(`${prefix} email`, html.includes('mailto:zisi.jon@yahoo.com'));
    check(`${prefix} LinkedIn`, html.includes('https://www.linkedin.com/in/jon-zisi/'));
    check(`${prefix} GitHub`, html.includes('https://github.com/JonZi1'));
    check(`${prefix} location`, html.includes('Athens, Greece'));
    check(`${prefix} PDF download attributes`, html.includes(`data-pdf="${variant.pdf}"`) && html.includes(`data-pdf-name="${variant.pdfName}"`));
    check(`${prefix} referenced PDF exists`, fs.existsSync(path.join(ROOT, variant.pdf)), variant.pdf);

    const summary = decode(section(html, 'summary'))
        .replace(/^Profile\s+/, '');
    const summaryWords = summary.split(/\s+/).filter(Boolean).length;
    check(`${prefix} profile is 45-60 words`, summaryWords >= 45 && summaryWords <= 60, `${summaryWords} words`);

    const pmArticle = article(html, 'ergeon', 'pm');
    const analystArticle = article(html, 'ergeon', 'analyst');
    check(`${prefix} Ergeon PM entry present`, Boolean(pmArticle));
    check(`${prefix} Ergeon analyst entry present`, Boolean(analystArticle));
    check(`${prefix} PM bullet allocation`, count(pmArticle, /<li(?:\s|>)/g) === variant.pmBullets, `${count(pmArticle, /<li(?:\s|>)/g)} bullets`);
    check(`${prefix} analyst bullet allocation`, count(analystArticle, /<li(?:\s|>)/g) === variant.analystBullets, `${count(analystArticle, /<li(?:\s|>)/g)} bullets`);
    check(`${prefix} six total Ergeon bullets`, count(pmArticle + analystArticle, /<li(?:\s|>)/g) === 6);
    check(`${prefix} Alpha Bank has one bullet`, count(article(html, 'alpha-bank'), /<li(?:\s|>)/g) === 1);
    check(`${prefix} Eurobank has one bullet`, count(article(html, 'eurobank'), /<li(?:\s|>)/g) === 1);

    const progression = 'Progressed from Junior Data Analyst to Junior Product Manager in four years.';
    check(`${prefix} progression statement exact`, count(html, new RegExp(progression.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) === 1);
    check(`${prefix} exactly one visible AI claim marker`, count(html, /data-ai-claim(?:\s|>)/g) === 1);
    const skills = section(html, 'skills');
    check(`${prefix} no AI skills category or tag`, !/AI[- ]Assisted|Claude Code|ChatGPT|Prompt Engineering/i.test(skills));
    check(`${prefix} certifications removed`, !/id="certifications"|<h2[^>]*>Certifications<\/h2>/i.test(html));

    const expectedOrder = ['summary', 'experience', 'skills', 'education', 'languages'];
    const positions = expectedOrder.map(id => html.indexOf(`id="${id}"`));
    check(`${prefix} required section order`, positions.every((pos, i) => pos >= 0 && (i === 0 || pos > positions[i - 1])), positions.join(', '));
    check(`${prefix} footer contains 2026`, /&copy;\s*2026\s+Jon Zisi/.test(html));

    const banned = ['Drawbridge', 'Connect to a local folder', 'Press C to make a comment', 'Disco', 'Jan 2022 - Present'];
    for (const term of banned) check(`${prefix} no contamination "${term}"`, !html.includes(term));

    const jira = html.match(/\b(DA|SYS|ENG|APPS|CAD|CM|IT|PO|PROD)-\d+\b/);
    const internalEmail = html.match(/[A-Za-z0-9._%+-]+@ergeon\.com/i);
    check(`${prefix} no Jira references`, !jira, jira?.[0]);
    check(`${prefix} no internal email`, !internalEmail, internalEmail?.[0]);
}

check('script: share title is dynamic', SCRIPT.includes('title: document.title'));
check('script: share description is dynamic', SCRIPT.includes('meta[name="description"]'));
check('script: no internal email', !/[A-Za-z0-9._%+-]+@ergeon\.com/i.test(SCRIPT));
check('script: no Jira references', !/\b(DA|SYS|ENG|APPS|CAD|CM|IT|PO|PROD)-\d+\b/.test(SCRIPT));

let failed = 0;
for (const result of checks) {
    const tag = result.pass ? 'OK  ' : 'FAIL';
    console.log(`${tag} ${result.name}${result.pass || !result.detail ? '' : ` — ${result.detail}`}`);
    if (!result.pass) failed += 1;
}
console.log(`---\n${checks.length - failed}/${checks.length} passed`);
process.exit(failed === 0 ? 0 : 1);
