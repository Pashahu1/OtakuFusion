import Link from "next/link";
import { usePathname } from "next/navigation";
import "./NavigationLink.scss";

type Props = {
  title: string;
};

export const NavigationLink: React.FC<Props> = ({ title }) => {
  const href = title.toLowerCase();
  const pathname = usePathname();

  const isActive = pathname === `/${href}`;

  return (
    <Link
      href={`/${href}`}
      className={`navbar-list-item__link ${isActive ? "active" : ""}`}
    >
      {title}
    </Link>
  );
};
