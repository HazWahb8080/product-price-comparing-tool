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
    "wss://production-sfo.browserless.io?token=750fcb31-ff6d-45ac-8e7b-4527046ac6dc";
  const IS_PRODUCTION = process.env.NODE_ENV === "production";

  const getBrowser = async () =>
    IS_PRODUCTION
      ? puppeteer.connect({ browserWSEndpoint })
      : puppeteer.launch({ headless: true });

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
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
      return items.slice(1, 11).map((item) => {
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
