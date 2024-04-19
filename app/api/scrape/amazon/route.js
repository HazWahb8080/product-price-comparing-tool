import puppeteer from "puppeteer";
import { NextResponse } from "next/server";
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(request) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
  const { productName } = await request.json();

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

  const browserWSEndpoint =
    "wss://chrome.browserless.io?token=750fcb31-ff6d-45ac-8e7b-4527046ac6dc";
  const IS_PRODUCTION = process.env.NODE_ENV === "production";

  const getBrowser = async () =>
    IS_PRODUCTION
      ? puppeteer.connect({ browserWSEndpoint })
      : puppeteer.launch({
          headless: false,
        });

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    // Custom user agent
    const customUA = generateRandomUA();

    // Set custom user agent
    await page.setUserAgent(customUA);
    await page.goto("https://www.amazon.com", {
      waitUntil: "domcontentloaded",
    });

    // Type the product name into the search input field and press Enter
    await page.waitForSelector("#twotabsearchtextbox");
    await page.type("#twotabsearchtextbox", productName);
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    // Extract data from the search results
    const searchResults = await page.$$eval(".s-result-item", (items) => {
      return items.slice(1, 20).map((item) => {
        const titleElement = item.querySelector("h2 > a");
        const priceElement = item.querySelector(".a-price > .a-offscreen");
        const urlElement = item.querySelector("h2 > a");
        const imageElement = item.querySelector(".s-image");

        // Check if elements are available before accessing their properties
        const title = titleElement
          ? titleElement.textContent.trim()
          : "Title not found";
        const price = priceElement
          ? parseFloat(priceElement.textContent.trim().replace("$", ""))
          : null;
        const url = urlElement ? urlElement.href : "#";
        const imageSrc = imageElement ? imageElement.src : null;

        if (
          title.includes() == "not found" ||
          !price ||
          url == "#" ||
          !imageSrc
        ) {
          // do nothing
        } else {
          return { title, price, url, imageSrc };
        }
      });
    });

    await browser.close();
    return Response.json(searchResults);
  } catch (error) {
    return Response.json(error.message);
  }
}
