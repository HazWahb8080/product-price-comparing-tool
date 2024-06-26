import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

export async function OPTIONS(request) {
  return NextResponse.json();
}
export const maxDuration = 40;

export async function POST(request) {
  const { productName } = await request.json();
  const IS_PRODUCTION = process.env.NODE_ENV === "production";

  const browserWSEndpoint = `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`;
  const getBrowser = async () =>
    IS_PRODUCTION
      ? puppeteer.connect({ browserWSEndpoint })
      : puppeteer.launch();
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.goto("https://www.ebay.com/");
    await page.waitForSelector("#gh-ac");
    await page.type("#gh-ac", productName);

    await page.waitForSelector("#gh-btn");
    await page.click("#gh-btn");

    await page.waitForSelector(".s-item"); // Wait for search results to load

    const searchResults = await page.evaluate(() => {
      const items = document.querySelectorAll(".s-item");
      return Array.from(items)
        .slice(1, 20)
        .map((item) => {
          const title = item.querySelector(".s-item__title").textContent.trim();
          const priceElement = item.querySelector(".s-item__price");
          let price = "";
          if (priceElement) {
            const priceText = priceElement.textContent.trim();
            // Remove currency symbols and keep only digits and commas
            price = Number(priceText.replace(/[^\d,.]/g, ""));
          }
          const imageSrc = item.querySelector(".s-item__image-wrapper img").src; // Extract image URL
          const url = item.querySelector("a").href;
          return { title, price, url, imageSrc };
        });
    });

    await browser.close();

    return Response.json(searchResults);
  } catch (error) {
    return Response.json(error.message);
  }
}
