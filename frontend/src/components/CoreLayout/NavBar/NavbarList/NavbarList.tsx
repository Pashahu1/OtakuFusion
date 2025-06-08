import { NavLink } from "@/components/NavLink/NavLink";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Image from "next/image";
export const NavbarList = () => {
  return (
    <ul className="navbar-list">
      <NavLink href="/search">
        <Image width={24} height={24} src="/icon/search.svg" alt="search" />
      </NavLink>
      <NavLink href="/animes">Anime</NavLink>
      <NavLink href="/login">
        <Avatar>
          <AvatarImage
            className="rounded-3xl"
            width={24}
            height={24}
            src="https://github.com/shadcn.png"
            alt="@shadcn"
          />
          <AvatarFallback>Avatar</AvatarFallback>
        </Avatar>
      </NavLink>
    </ul>
  );
};
