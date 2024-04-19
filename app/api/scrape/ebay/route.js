import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

export async function OPTIONS(request) {
  return NextResponse.json();
}

export async function POST(request) {
  const { productName } = await request.json();

  const browserWSEndpoint =
    "wss://production-sfo.browserless.io?token=750fcb31-ff6d-45ac-8e7b-4527046ac6dc";
  const IS_PRODUCTION = process.env.NODE_ENV === "production";

  // const getBrowser = async () =>
  //   IS_PRODUCTION
  //     ? puppeteer.connect({ browserWSEndpoint })
  //     : puppeteer.launch({
  //         headless: true,
  //       });

  try {
    const browser = await puppeteer.launch({
      headless: true,
    });
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
          const priceElement = item
            .querySelector(".s-item__price")
            .textContent.trim();
          const price = parseFloat(priceElement.replace("$", ""));
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
