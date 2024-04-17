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

  const browserWSEndpoint =
    "https://production-sfo.browserless.io?token=GOES-HERE";

  const getBrowser = async () =>
    process.env.NODE_ENV === "production"
      ? puppeteer.connect({ browserWSEndpoint })
      : puppeteer.launch();

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.goto("https://www.amazon.com");

    // Type the product name into the search input field and press Enter
    await page.waitForSelector("#twotabsearchtextbox");
    await page.type("#twotabsearchtextbox", productName);
    await page.keyboard.press("Enter");
    await page.waitForNavigation();

    // Extract data from the search results
    const searchResults = await page.$$eval(".s-result-item", (items) => {
      return items.slice(1, 11).map((item) => {
        const titleElement = item.querySelector("h2 > a");
        const priceElement = item.querySelector(".a-price > .a-offscreen");
        const urlElement = item.querySelector("h2 > a");

        // Check if elements are available before accessing their properties
        const title = titleElement
          ? titleElement.textContent.trim()
          : "Title not found";
        const price = priceElement
          ? priceElement.textContent.trim()
          : "Price not found";
        const url = urlElement ? urlElement.href : "#";
        if (
          title.includes() == "not found" ||
          price.includes() == "not found" ||
          url == "#"
        ) {
          null;
        } else {
          return { title, price, url };
        }
      });
    });

    await browser.close();
    return Response.json(searchResults);
  } catch (error) {
    return Response.json({ error: error.message });
  }
}
