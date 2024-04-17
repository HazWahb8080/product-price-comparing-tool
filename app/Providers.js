"use client";
import React from "react";
import { RecoilRoot } from "recoil";

function Providers({ children }) {
  return <RecoilRoot>{children}</RecoilRoot>;
}

export default Providers;
