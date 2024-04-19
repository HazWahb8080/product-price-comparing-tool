import puppeteer from "puppeteer-extra";
import { NextResponse } from "next/server";
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(request) {
  return NextResponse.json({}, { headers: corsHeaders });
}
export const maxDuration = 40;

export async function POST(request) {
  const { productName } = await request.json();
  const browserWSEndpoint = `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`;

  const generateRandomUA = () => {
    // Array of random user agents
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
    ];
    // Get a random index based on the length of the user agents array
    const randomUAIndex = Math.floor(Math.random() * userAgents.length);
    // Return a random user agent using the index above
    return userAgents[randomUAIndex];
  };
  try {
    // const browser = await puppeteer.connect({ browserWSEndpoint });
    const browser = await puppeteer.connect({ browserWSEndpoint });
    const page = await browser.newPage();
    // Custom user agent
    const customUA = generateRandomUA();

    // Set custom user agent
    await page.setUserAgent(customUA);

    // handling the search query of aliexpress
    let productNameOneWord =
      productName.trim().split(" ").length > 1 ? false : true;
    let newProductName = productNameOneWord
      ? `wholesale-${productName.trim()}`
      : productName.trim().replaceAll(" ", "-");
    await page.goto(`https://www.aliexpress.us/w/${newProductName}.html`);

    await page.waitForSelector(".search-item-card-wrapper-gallery");

    const searchResults = await page.evaluate(() => {
      const items = document.querySelectorAll(
        ".search-item-card-wrapper-gallery"
      );
      return Array.from(items)
        .slice(0, 10)
        .map((item) => {
          const title = item
            .querySelector(".multi--titleText--nXeOvyr")
            .textContent.trim();
          const priceElement = item
            .querySelector(".multi--price-sale--U-S0jtj")
            .textContent.trim();
          const price = parseFloat(priceElement.replace("$", ""));
          const url = item.querySelector(
            ".search-item-card-wrapper-gallery a"
          ).href;
          return { title, price, url };
        });
    });

    await browser.close();
    return Response.json(searchResults);
  } catch (error) {
    return Response.json(error.message);
  }
}
