/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import axios from "axios";

// #9FFF45 yellow
// #131633 blackish
// #2135E5 blueish

export default function Home() {
  const [productName, setProductName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLaoding] = useState(false);
  const [averagePrice, setAveragePrice] = useState();
  const [error, setError] = useState("");
  const submitForm = async () => {
    setLaoding(true);
    if (loading) return;
    const response = await axios.post("/api/scrape", { productName });
    const refinedData = response.data;
    setResults(refinedData);
    setLaoding(false);
  };
  useEffect(() => {
    if (results.length == 0) return;
    // Calculate average, lowest, and highest prices
    let totalPrice = 0;
    results
      .filter((item) => item !== null)
      .forEach((item) => {
        if (item.price !== null) {
          totalPrice += item.price;
        }
      });

    setAveragePrice(results.length > 0 ? totalPrice / results.length : 0);
  }, [results]);

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

      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-x-4 mt-12">
          <div
            className="col-span-2 w-full place-items-center gap-6 mt-12 
        max-h-[70vh] overflow-y-scroll bg-white text-black 
        font-medium py-10 px-6 border border-black/10 "
          >
            {results
              .filter((item) => item !== null)
              .map((item) => (
                <div key={item.title} className="border-b border-black py-10 ">
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
