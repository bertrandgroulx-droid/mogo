// The share button and the ?country= link it hands out, driven through the real
// page in headless Chromium. Run with `npm test` (node --test).
//
// Playwright is loaded from wherever it is installed: the usual module
// resolution first, then PLAYWRIGHT_LIB or the shared install this studio's
// containers carry. With none of those the tests are skipped, not failed.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const here = path.dirname(fileURLToPath(import.meta.url));
const page_url = pathToFileURL(path.join(here, "..", "index.html")).href;

async function loadPlaywright() {
  try { return await import("playwright"); } catch (_) {}
  const fallback = process.env.PLAYWRIGHT_LIB || "/opt/node22/lib/node_modules/playwright/index.mjs";
  if (fs.existsSync(fallback)) return import(pathToFileURL(fallback).href);
  return null;
}

const pw = await loadPlaywright();
const skip = pw ? false : "Playwright is not installed; the browser tests were skipped";

let browser;
before(async () => { if (pw) browser = await pw.chromium.launch(); });
after(async () => { if (browser) await browser.close(); });

// A fresh page with a laptop's share facilities: no share sheet, a clipboard
// that records what it was given. Network is cut so TheMealDB and the kit never
// answer and every state is reached offline, the same way every time.
async function open(query = "", { clipboard = true, share = false } = {}) {
  const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
  await context.route(/^https?:\/\//, (route) => route.abort());
  await context.addInitScript(({ clipboard, share }) => {
    window.__copied = [];
    window.__shared = [];
    if (clipboard) {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: async (t) => { window.__copied.push(t); } }, configurable: true,
      });
    } else {
      Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    }
    Object.defineProperty(navigator, "share", {
      value: share ? async (data) => { window.__shared.push(data); } : undefined,
      configurable: true,
    });
  }, { clipboard, share });
  const page = await context.newPage();
  await page.goto(page_url + query);
  return { page, context };
}

const waitForCountry = (page) => page.waitForSelector(".country-name", { timeout: 10000 });
const toastText = (page) => page.locator(".toast.show").textContent();

test("the icon sits beside the name and shares the plain address when nothing is on screen", { skip }, async () => {
  const { page, context } = await open();
  const btn = page.locator("#shareBtn");
  assert.equal(await btn.getAttribute("aria-label"), "Share a link to this");
  const box = await btn.boundingBox();
  const name = await page.locator(".logo-text").boundingBox();
  assert.ok(box.width >= 28 && box.height >= 28, "hit area is at least 28px");
  assert.ok(box.x >= name.x + name.width, "the icon is to the right of the name");
  const mid = (b) => b.y + b.height / 2;
  assert.ok(Math.abs(mid(box) - mid(name)) < 4, "the icon is vertically centred on the name");
  await btn.click();
  assert.deepEqual(await page.evaluate(() => window.__copied), ["https://shozbot.com/mogo/"]);
  assert.equal(await toastText(page), "Link copied");
  await context.close();
});

test("with a country on screen the link carries its code and the title names it", { skip }, async () => {
  const { page, context } = await open("", { share: true });
  await page.selectOption("#countryPicker", "Japan");
  await waitForCountry(page);
  await page.click("#shareBtn");
  assert.deepEqual(await page.evaluate(() => window.__shared), [
    { title: "Mogo · Japan", url: "https://shozbot.com/mogo/?country=JP" },
  ]);
  await context.close();
});

test("?country=jp opens on Japan, whatever the case of the code", { skip }, async () => {
  const { page, context } = await open("?country=jp");
  await waitForCountry(page);
  assert.equal(await page.locator(".country-name a").innerText(), "Japan📍");
  assert.equal(await page.locator("#progress").innerText(), "🌍 Explored 1 of 199 countries");
  await page.click("#shareBtn");
  assert.deepEqual(await page.evaluate(() => window.__copied), ["https://shozbot.com/mogo/?country=JP"]);
  await context.close();
});

test("an unknown code is the plain page", { skip }, async () => {
  const { page, context } = await open("?country=ZZ");
  await page.waitForTimeout(300);
  assert.equal(await page.locator(".country-name").count(), 0);
  assert.equal(await page.locator(".loader.active").count(), 0);
  await page.click("#shareBtn");
  assert.deepEqual(await page.evaluate(() => window.__copied), ["https://shozbot.com/mogo/"]);
  await context.close();
});

test("the ?country= query comes off the address once opened, so a reload is the plain page", { skip }, async () => {
  const { page, context } = await open("?country=JP");
  await waitForCountry(page);
  assert.equal(await page.evaluate(() => location.search), "");
  await page.click("#discoverBtn");
  await page.waitForFunction(() => document.querySelector(".country-name") && !document.querySelector(".country-name").textContent.includes("Japan"), null, { timeout: 10000 });
  await page.reload();
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => location.search), "");
  assert.equal(await page.locator(".country-name").count(), 0);
  assert.equal(await page.locator(".loader.active").count(), 0);
  await page.click("#shareBtn");
  assert.deepEqual(await page.evaluate(() => window.__copied), ["https://shozbot.com/mogo/"]);
  await context.close();
});

test("paging back through history shares the country now on screen", { skip }, async () => {
  const { page, context } = await open("?country=PE");
  await waitForCountry(page);
  await page.selectOption("#countryPicker", "Ghana");
  await page.waitForFunction(() => document.querySelector(".country-name")?.textContent.includes("Ghana"), null, { timeout: 10000 });
  await page.click(".nav-prev");
  await page.click("#shareBtn");
  assert.deepEqual(await page.evaluate(() => window.__copied), ["https://shozbot.com/mogo/?country=PE"]);
  await context.close();
});

test("with neither share sheet nor clipboard, the toast shows the link itself", { skip }, async () => {
  const { page, context } = await open("", { clipboard: false });
  await page.click("#shareBtn");
  assert.equal(await toastText(page), "https://shozbot.com/mogo/");
  await context.close();
});

test("every flag decodes to a distinct two-letter code", { skip }, async () => {
  const { page, context } = await open();
  const codes = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#countryPicker option")).map((o) => o.value).filter(Boolean)
  );
  assert.equal(codes.length, 199);
  // Each name must be reachable by a code: pick a few across the alphabet.
  for (const [code, name] of [["US", "United States"], ["GB", "United Kingdom"], ["SB", "Solomon Islands"], ["in", "India"]]) {
    const p = await context.newPage();
    await p.goto(page_url + "?country=" + code);
    await waitForCountry(p);
    assert.equal(await p.locator(".country-name a").innerText(), name + "📍");
    await p.close();
  }
  await context.close();
});

test("nothing scrolls sideways at phone widths with the icon in", { skip }, async () => {
  for (const viewport of [{ width: 375, height: 667 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
    const context = await browser.newContext({ viewport });
    await context.route(/^https?:\/\//, (route) => route.abort());
    const page = await context.newPage();
    await page.goto(page_url + "?country=JP");
    await waitForCountry(page);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.equal(over, 0, `${viewport.width}px wide: ${over}px of sideways overflow`);
    await context.close();
  }
});
