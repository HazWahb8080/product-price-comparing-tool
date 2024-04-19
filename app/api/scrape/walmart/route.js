import puppeteer from "puppeteer";
import { NextResponse } from "next/server";
import puppeteerExtra from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";

export async function OPTIONS(request) {
  return NextResponse.json();
}

export async function POST(request) {
  const { productName } = await request.json();
  puppeteerExtra.use(StealthPlugin());
  puppeteerExtra.use(AnonymizeUAPlugin());

  const browserWSEndpoint =
    "wss://production-sfo.browserless.io?token=750fcb31-ff6d-45ac-8e7b-4527046ac6dc";
  const IS_PRODUCTION = process.env.NODE_ENV === "production";

  const getBrowser = async () =>
    IS_PRODUCTION
      ? puppeteerExtra.connect({ browserWSEndpoint })
      : puppeteerExtra.launch({
          headless: false,
        });

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(`https://www.walmart.com/search?q=${productName}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    const searchResults = await page.evaluate(() => {
      console.log("items");
      const items = document.querySelectorAll("section");
      return Array.from(items)
        .slice(1, 11)
        .map((item) => {
          console.log(item);
          const priceElement = item.querySelector("span.w_iUH7");
          const titleElement = item.querySelector(
            "span[data-automation-id='product-title']"
          );
          const title = titleElement
            ? titleElement.textContent.trim()
            : "Title not found";
          const price = priceElement
            ? priceElement.textContent.trim()
            : "Price not found";

          if (title.includes("not found")) {
            // do nothing
            return null;
          } else {
            return { title, price };
          }
        })
        .filter(Boolean); // Remove null values from the array
    });

    // await browser.close();
    console.log(searchResults);
    return Response.json(searchResults);
  } catch (error) {
    return Response.json(error.message);
  }
}
