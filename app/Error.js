"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  const router = useRouter();
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="w-full min-h-screen items-center justify-center flex font-mono">
      <h2 className="text-red-500 text-xl">Something went wrong!</h2>
      <button onClick={() => router.push("/")}>Try again</button>
    </div>
  );
}
