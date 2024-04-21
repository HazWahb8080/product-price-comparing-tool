/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRecoilState } from "recoil";
import { AliExpressResultsState, EbayResultsState } from "./atoms";

// #9FFF45 yellow
// #131633 blackish
// #2135E5 blueish
const tabs = [
  { id: 0, name: "AliExpress" },
  { id: 1, name: "Ebay" },
];

export default function Home() {
  const [productName, setProductName] = useState("");
  const [AliExpressResults, setAliExpressResults] = useRecoilState(
    AliExpressResultsState
  );
  const [EbayResults, setEbayResults] = useRecoilState(EbayResultsState);
  const [loading, setLoading] = useState(false);
  const [averagePrice, setAveragePrice] = useState({ aliExpress: 0, ebay: 0 });
  const [error, setError] = useState("");
  const [activePlatformTab, setActivePlatformTab] = useState("AliExpress");

  // handling the form
  const submitForm = async () => {
    setLoading(true);
    if (loading || productName.trim() == "") return;
    // clear the previous results if..
    setAliExpressResults([]);
    setEbayResults([]);

    const aliExpressRequest = axios
      .post("/api/scrape/aliExpress", { productName })
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error scraping Amazon:", error);
        return null;
      });

    const ebayRequest = axios
      .post("/api/scrape/ebay", { productName })
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error scraping eBay:", error);
        return null;
      });

    const [aliExpressData, ebayData] = await Promise.all([
      aliExpressRequest,
      ebayRequest,
    ]);

    setAliExpressResults(aliExpressData);
    setEbayResults(ebayData);
    setLoading(false);
  };

  // calculate the average price of aliExpress results
  useEffect(() => {
    let newArray = [...AliExpressResults];
    if (newArray.length == 0) return;
    // Calculate average, lowest, and highest prices
    let totalPrice = 0;
    newArray
      .filter((item) => item !== null)
      .forEach((item) => {
        if (item.price !== null) {
          totalPrice += Number(item.price);
        }
      });

    setAveragePrice((curr) => {
      return {
        ...curr,
        aliExpress: newArray.length > 0 ? totalPrice / newArray.length : 0,
      };
    });
  }, [AliExpressResults]);
  // calculate the average price of Ebay results
  useEffect(() => {
    if (EbayResults.length == 0) return;
    let newArray = [...EbayResults];

    // Calculate average, lowest, and highest prices
    let totalPrice = 0;
    newArray
      .filter((item) => item !== null)
      .forEach((item) => {
        if (item.price !== null) {
          totalPrice += Number(item.price);
        }
      });
    setAveragePrice((curr) => {
      return {
        ...curr,
        ebay: newArray.length > 0 ? totalPrice / newArray.length : 0,
      };
    });
  }, [EbayResults]);

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
            onKeyDown={(e) => e.key === "Enter" && submitForm()}
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

      {AliExpressResults.length > 0 && (
        <span className="w-full py-4 items-center justify-center flex space-x-2 mt-12 border-b border-black/20">
          {tabs.map((tab) => (
            <span
              onClick={() => setActivePlatformTab(tab.name)}
              key={tab.id}
              className={`cursor-pointer p-2 w-[30%] text-center rounded-sm
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

      {AliExpressResults.length > 0 && activePlatformTab == "AliExpress" && (
        <div className="grid grid-cols-3 gap-x-4 ">
          <div
            className="col-span-2 w-full place-items-center gap-6 mt-12 
        max-h-[100vh] overflow-y-scroll bg-white text-black 
        font-medium py-10 px-6 border border-black/10 "
          >
            {AliExpressResults.filter((item) => item !== null).map(
              (item, i) => (
                <div
                  key={item.title + item.price + i}
                  className="border-b border-black/20 py-10 "
                >
                  <img
                    src={item.imageSrc}
                    className="h-[300px] w-[300px] object-fit object-center 
                  mb-4 rounded-xl border border-black/10"
                    alt={item.title + "-image"}
                    crossOrigin="anonymous"
                  />
                  <p className="text-black/80 w-[80%]">{item.title}</p>
                  <p className="font-bold text-xl">${item.price}</p>
                  <a
                    target="_blank"
                    href={item.url}
                    className="cursor-pointer smooth opacity-70 hover:opacity-100"
                  >
                    check product →
                  </a>
                </div>
              )
            )}
          </div>
          <div className="col-span-1 h-full items-center justify-center flex">
            <h1 className="text-2xl text-center">
              {activePlatformTab} Average Price is <br />{" "}
              <b className="text-3xl">${averagePrice.aliExpress.toFixed(2)}</b>
            </h1>
          </div>
        </div>
      )}
      {EbayResults.length > 0 && activePlatformTab == "Ebay" && (
        <div className="grid grid-cols-3 gap-x-4">
          <div
            className="col-span-2 w-full place-items-center gap-6 mt-12 
        max-h-[100vh] overflow-y-scroll bg-white text-black 
        font-medium py-10 px-6 border border-black/10 "
          >
            {EbayResults.filter((item) => item !== null).map((item) => (
              <div
                key={item.title + item.price}
                className="border-b border-black/20 py-10 "
              >
                <img
                  src={item.imageSrc}
                  className="h-[300px] w-[300px] object-fit object-center mb-4 rounded-xl"
                  alt={item.title + "-image"}
                />
                <p className="text-black/80 w-[80%]">{item.title}</p>
                <p className="font-bold text-xl">${item.price}</p>
                <a
                  href={item.url}
                  target="_blank"
                  className="cursor-pointer smooth opacity-70 hover:opacity-100"
                >
                  check product →
                </a>
              </div>
            ))}
          </div>
          <div className="col-span-1 h-full items-center justify-center flex">
            <h1 className="text-2xl text-center">
              {activePlatformTab} Average Price is <br />{" "}
              <b className="text-3xl">${averagePrice.ebay.toFixed(2)}</b>
            </h1>
          </div>
        </div>
      )}

      {error && <div>{error}</div>}
    </main>
  );
}
