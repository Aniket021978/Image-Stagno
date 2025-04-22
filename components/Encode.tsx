import React, { useState } from "react";
import EncodeText from "./EncodeText";
import EncodeImage from "./EncodeImages";
import { Card, Button } from "@nextui-org/react";

const Encode = () => {
  const [mode, setMode] = useState<"text" | "image" | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative text-neutral-200 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#111] via-[#181818] to-[#111]"></div>
      <div className="relative z-10 text-center">
        {mode === null ? (
          <>
            <p className="text-2xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-1">
              Choose an <strong className="text-red-400">encoding</strong> method
            </p>
            <Card
  isBlurred
  className="max-w-4xl w-full mx-auto px-8 py-12 my-12 shadow-xl bg-gradient-to-br from-[#0f0f0f] via-[#1c1c1c] to-[#0f0f0f] border-none rounded-3xl"
>
  <div className="flex flex-col sm:flex-row gap-8 justify-center items-center w-full">
    <Button
      className="w-full sm:w-[320px] h-[120px] rounded-3xl text-lg sm:text-xl font-bold text-white bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 shadow-[0_8px_30px_rgba(255,100,100,0.4)] hover:scale-105 transition-all duration-300 ease-in-out text-center leading-snug"
      onClick={() => setMode("text")}
    >
      Encode Text &<br /> Image in Text
    </Button>
    <Button
      className="w-full sm:w-[320px] h-[120px] rounded-3xl text-lg sm:text-xl font-bold text-white bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-[0_8px_30px_rgba(0,200,255,0.4)] hover:scale-105 transition-all duration-300 ease-in-out text-center leading-snug"
      onClick={() => setMode("image")}
    >
      Encode Text &<br /> Image in Image
    </Button>
  </div>
</Card>

          </>
        ) : mode === "text" ? (
          <EncodeText />
        ) : (
          <EncodeImage />
        )}
      </div>
    </div>
  );
};

export default Encode;