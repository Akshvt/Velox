import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Collect logs
  page.on('console', msg => console.log(`CONSOLE: ${msg.type()} ${msg.text()}`));
  page.on('pageerror', err => console.log(`PAGE ERROR: ${err}`));

  // Go to page and login
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"]', 'admin@testcorp.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5173/admin');
  
  // Go to FAQ and click New FAQ
  await page.goto('http://localhost:5173/admin?tab=faq');
  await page.waitForTimeout(2000);
  
  try {
    await page.click('text="New FAQ"');
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log(`Failed to click New FAQ: ${e}`);
  }

  // Go to Agents and click Add Agent
  await page.goto('http://localhost:5173/admin?tab=agents');
  await page.waitForTimeout(2000);
  
  try {
    await page.click('text="Add Agent"');
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log(`Failed to click Add Agent: ${e}`);
  }

  await browser.close();
})();
