import { Button, Link } from "@nextui-org/react";
import React from "react";

const Hero = () => {
  return (
    <div className="flex items-center justify-center min-h-screen relative text-neutral-200">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#1E1E1E] to-[#0A0A0A]"></div>

      <div className="relative text-center">
        <p className="text-4xl sm:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#E0E0E0] to-[#AAAAAA] py-10">
          Hide Your Secrets Like a Spy
        </p>
        <div className="flex justify-center">
          <Button className="bg-gradient-to-r from-[#16A085] to-[#1ABC9C] hover:opacity-90 text-white px-6 py-2 rounded-md shadow-xl">
            <Link href="/learn" className="text-inherit">
              Learn More
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
