/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRecoilState } from "recoil";
import {
  AmazonResultsState,
  BestBuyResultsState,
  WalmartResultsState,
} from "./atoms";

// #9FFF45 yellow
// #131633 blackish
// #2135E5 blueish
const tabs = [
  { id: 0, name: "Amazon" },
  { id: 1, name: "Walmart" },
  { id: 2, name: "BestBuy" },
];

export default function Home() {
  const [productName, setProductName] = useState("");
  const [AmazonResults, setAmazonResults] = useRecoilState(AmazonResultsState);
  const [BestBuyResults, setBestBuyResults] =
    useRecoilState(BestBuyResultsState);
  const [WalmartResults, setWalmartResults] =
    useRecoilState(WalmartResultsState);
  const [loading, setLaoding] = useState(false);
  const [averagePrice, setAveragePrice] = useState();
  const [error, setError] = useState("");
  const [activePlatformTab, setActivePlatformTab] = useState("Amazon");

  // handling the form
  const submitForm = async () => {
    setLaoding(true);
    if (loading) return;
    const amazonRequest = async () => {
      await axios.post("/api/amazon/scrape", { productName });
    };
    const walmartRequest = async () => {
      await axios.post("/api/walmart/scrape", { productName });
    };
    const bestbuyRequest = async () => {
      await axios.post("/api/bestbuy/scrape", { productName });
    };
    const [amazon, walmart, bestbuy] = await Promise.all([
      amazonRequest(),
      walmartRequest(),
      bestbuyRequest(),
    ]);
    setAmazonResults(amazon.data);
    setWalmartResults(walmart.data);
    setBestBuyResults(bestbuy.data);
    setLaoding(false);
  };
  // calculate the average price of amazon results
  useEffect(() => {
    if (AmazonResults.length == 0 || activePlatformTab !== "Amazon") return;
    // Calculate average, lowest, and highest prices
    let totalPrice = 0;
    AmazonResults.filter((item) => item !== null).forEach((item) => {
      if (item.price !== null) {
        totalPrice += item.price;
      }
    });

    setAveragePrice(
      AmazonResults.length > 0 ? totalPrice / AmazonResults.length : 0
    );
  }, [AmazonResults]);
  // calculate the average price of walmart results
  useEffect(() => {
    if (WalmartResults.length == 0 || activePlatformTab !== "Amazon") return;
    // Calculate average, lowest, and highest prices
    let totalPrice = 0;
    WalmartResults.filter((item) => item !== null).forEach((item) => {
      if (item.price !== null) {
        totalPrice += item.price;
      }
    });

    setAveragePrice(
      WalmartResults.length > 0 ? totalPrice / WalmartResults.length : 0
    );
  }, [WalmartResults]);
  // calculate the average price of bestbuy results
  useEffect(() => {
    if (BestBuyResults.length == 0 || activePlatformTab !== "Amazon") return;
    // Calculate average, lowest, and highest prices
    let totalPrice = 0;
    BestBuyResults.filter((item) => item !== null).forEach((item) => {
      if (item.price !== null) {
        totalPrice += item.price;
      }
    });

    setAveragePrice(
      BestBuyResults.length > 0 ? totalPrice / BestBuyResults.length : 0
    );
  }, [BestBuyResults]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col 
    items-center justify-center p-24 bg-white text-[#131633] font-mono animate-pulse"
      >
        searching the web for you ... {":)"}
      </div>
    );
  }
  return (
    <main
      className="flex min-h-screen flex-col 
    items-center justify-start p-24 bg-white text-[#131633] font-mono  "
    >
      <h1 className="text-2xl text-center w-full font-bold ">
        Compare Prices of any product <br /> in One Place.
      </h1>
      <form className="mt-12 w-full items-center justify-center flex flex-col">
        <span
          className="flex border-b smooth hover:border-black/50 w-1/2
           border-black/5"
        >
          <input
            type="text"
            placeholder="product name ... "
            className="w-full outline-none  px-4 py-2 placeholder:text-black/50"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          {productName.trim() !== "" && (
            <img
              onClick={submitForm}
              title="go"
              className="h-6 w-6 smooth opacity-50 hover:opacity-100 cursor-pointer"
              alt="right-arrow"
              src="./arrow.png"
            />
          )}
        </span>
      </form>

      {AmazonResults.length == 0 && (
        <span className="w-full py-4 items-center justify-center flex space-x-2 mt-12">
          {tabs.map((tab) => (
            <span
              onClick={() => setActivePlatformTab(tab.name)}
              key={tab.key}
              className={`cursor-pointer p-2
               smooth ${
                 tab.name == activePlatformTab
                   ? "text-[#9FFF45] bg-[#131633]"
                   : "text-black hover:text-[#9FFF45] hover:bg-[#131633]"
               } `}
            >
              {tab.name}
            </span>
          ))}
        </span>
      )}

      {AmazonResults.length > 0 &&
        activePlatformTab ==
          "Amazon"(
            <div className="grid grid-cols-3 gap-x-4 mt-12">
              <div
                className="col-span-2 w-full place-items-center gap-6 mt-12 
        max-h-[70vh] overflow-y-scroll bg-white text-black 
        font-medium py-10 px-6 border border-black/10 "
              >
                {AmazonResults.filter((item) => item !== null).map((item) => (
                  <div
                    key={item.title}
                    className="border-b border-black py-10 "
                  >
                    <img
                      src={item.imageSrc}
                      className="h-[300px] w-[300px] object-cover object-center mb-4"
                      alt={item.title + "-image"}
                    />
                    <p>{item.title}</p>
                    <p className="font-bold">${item.price}</p>
                    <a href={item.link} className="cursor-pointer">
                      check product →
                    </a>
                  </div>
                ))}
              </div>
              <div className="col-span-1 h-full items-center justify-center flex">
                <h3>
                  Average Price is <br /> <b>${averagePrice.toFixed(2)}</b>
                </h3>
              </div>
            </div>
          )}
      {WalmartResults.length > 0 &&
        activePlatformTab ==
          "Walmart"(
            <div className="grid grid-cols-3 gap-x-4 mt-12">
              <div
                className="col-span-2 w-full place-items-center gap-6 mt-12 
        max-h-[70vh] overflow-y-scroll bg-white text-black 
        font-medium py-10 px-6 border border-black/10 "
              >
                {WalmartResults.filter((item) => item !== null).map((item) => (
                  <div
                    key={item.title}
                    className="border-b border-black py-10 "
                  >
                    <img
                      src={item.imageSrc}
                      className="h-[300px] w-[300px] object-cover object-center mb-4"
                      alt={item.title + "-image"}
                    />
                    <p>{item.title}</p>
                    <p className="font-bold">${item.price}</p>
                    <a href={item.link} className="cursor-pointer">
                      check product →
                    </a>
                  </div>
                ))}
              </div>
              <div className="col-span-1 h-full items-center justify-center flex">
                <h3>
                  Average Price is <br /> <b>${averagePrice.toFixed(2)}</b>
                </h3>
              </div>
            </div>
          )}
      {BestBuyResults.length > 0 &&
        activePlatformTab ==
          "BestBuy"(
            <div className="grid grid-cols-3 gap-x-4 mt-12">
              <div
                className="col-span-2 w-full place-items-center gap-6 mt-12 
        max-h-[70vh] overflow-y-scroll bg-white text-black 
        font-medium py-10 px-6 border border-black/10 "
              >
                {BestBuyResults.filter((item) => item !== null).map((item) => (
                  <div
                    key={item.title}
                    className="border-b border-black py-10 "
                  >
                    <img
                      src={item.imageSrc}
                      className="h-[300px] w-[300px] object-cover object-center mb-4"
                      alt={item.title + "-image"}
                    />
                    <p>{item.title}</p>
                    <p className="font-bold">${item.price}</p>
                    <a href={item.link} className="cursor-pointer">
                      check product →
                    </a>
                  </div>
                ))}
              </div>
              <div className="col-span-1 h-full items-center justify-center flex">
                <h3>
                  Average Price is <br /> <b>${averagePrice.toFixed(2)}</b>
                </h3>
              </div>
            </div>
          )}
      {error && <div>{error}</div>}
    </main>
  );
}
