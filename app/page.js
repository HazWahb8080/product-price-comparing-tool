/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import axios from "axios";

// #9FFF45 yellow
// #131633 blackish
// #2135E5 blueish

export default function Home() {
  const [productName, setProductName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLaoding] = useState(false);
  const [error, setError] = useState("");
  const submitForm = async () => {
    setLaoding(true);
    if (loading) return;
    const response = await axios.post("/api/scrape", { productName });
    setResults(response.data);
    response.data.includes("error")
      ? setError(response.data)
      : setLaoding(false);
  };
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
        <div
          className="w-full place-items-center gap-6 mt-12 
        max-h-[50vh] overflow-y-scroll bg-[#131633] text-[#9FFF45] py-10 px-6 "
        >
          {results.map((item) => (
            <div key={item.title} className="border-b border-[#9FFF45] py-4">
              <p>{item.title}</p>
              <p>{item.price}</p>
              <a href={item.link} className="cursor-pointer">
                check
              </a>
            </div>
          ))}
        </div>
      )}
      {error && <div>{error}</div>}
    </main>
  );
}
