import Encode from "@/components/Encode";
import NavBar from "@/components/NavBar";
import "@/app/globals.css";

const index = () => {
  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-b from-[#111] via-[#181818] to-[#111] text-neutral-200 overflow-hidden">
      <header className="absolute top-0 left-0 w-full z-10 bg-neutral-800/80 backdrop-blur-md shadow-md">
        <NavBar activePage="/encode" />
      </header>
      <main className="flex-grow flex items-center justify-center pt-16">
        <Encode />
      </main>
    </div>
  );
};

export default index;
