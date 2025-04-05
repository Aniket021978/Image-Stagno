"use client";

import { useEffect, useState } from "react";
import Learn from "@/components/Learn";
import NavBar from "@/components/NavBar";
import "@/app/globals.css";

const Index = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col relative bg-neutral-900 text-neutral-200">
      <header className="absolute top-0 left-0 w-full z-10 bg-neutral-800/80 backdrop-blur-md shadow-md">
        <NavBar activePage="/learn" />
      </header>
      <main className="flex-grow bg-gradient-to-b from-neutral-900 to-neutral-950 text-neutral-200 pt-16">
        <Learn />
      </main>
    </div>
  );
};

export default Index;
