import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
} from "@nextui-org/react";

interface NavBarProps {
  activePage: string;
}

export default function NavBar({ activePage }: NavBarProps) {
  return (
    <Navbar maxWidth="2xl" className="bg-gray-800 navbar">
      <NavbarBrand>
        <p className="font-bold text-inherit">
          <Link href="/" className="text-lg text-white">
            Stagno
          </Link>
        </p>
      </NavbarBrand>
      <NavbarContent className="flex gap-4 sm:gap-6 md:gap-10 navbar-content" justify="center">
        <NavbarItem isActive={activePage === "/"}>
          <Link
            color={activePage === "/" ? "secondary" : "foreground"}
            href="/"
            aria-current="page"
            className="text-sm sm:text-base md:text-lg text-white"
          >
            Home
          </Link>
        </NavbarItem>
        <NavbarItem isActive={activePage === "/encode"}>
          <Link
            color={activePage === "/encode" ? "secondary" : "foreground"}
            href="/encode"
            aria-current="page"
            className="text-sm sm:text-base md:text-lg text-white"
          >
            Encode
          </Link>
        </NavbarItem>
        <NavbarItem isActive={activePage === "/decode"}>
          <Link
            color={activePage === "/decode" ? "secondary" : "foreground"}
            href="/decode"
            aria-current="page"
            className="text-sm sm:text-base md:text-lg text-white"
          >
            Decode
          </Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}