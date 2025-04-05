import Hero from "@/components/Hero";
import NavBar from "@/components/NavBar";
import "@/app/globals.css";

const index = () => {
  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-b from-[#0A0A0A] via-[#1E1E1E] to-[#0A0A0A] text-neutral-200">
      <header className="absolute top-0 left-0 w-full z-10 h-30 bg-neutral-100/10 backdrop-blur-md shadow-lg">
        <NavBar activePage="/" />
      </header>
      <main className="flex-grow flex items-center justify-center pt-2">
        <Hero />
      </main>
    </div>
  );
};

export default index;
