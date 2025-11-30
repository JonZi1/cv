const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8000');
    const header = await page.$('header');
    await header.screenshot({ path: 'header-check.png' });
    console.log('Done');
    await browser.close();
})();
