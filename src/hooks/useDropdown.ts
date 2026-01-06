import { useState, useEffect, useRef } from "react";
import type { RefObject } from "react";

type UseDropdownResult<
  TTrigger extends HTMLElement,
  TMenu extends HTMLElement
> = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  triggerRef: RefObject<TTrigger | null>;
  menuRef: RefObject<TMenu | null>; //
};

export function useDropdown<
  TTrigger extends HTMLElement = HTMLElement,
  TMenu extends HTMLElement = HTMLElement
>(): UseDropdownResult<TTrigger, TMenu> {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<TTrigger | null>(null);
  const menuRef = useRef<TMenu | null>(null);

  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    document.body.classList.toggle("body--backdrop", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    document.body.classList.toggle("body--hidden", isOpen);
    document.documentElement.classList.toggle("body--hidden", isOpen);

    if (!isOpen) return;

    function onClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        close();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove(
        "body--backdrop",
        "menu-open",
        "body--hidden"
      );
      document.documentElement.classList.remove("body--hidden");
    };
  }, [isOpen]);

  return { isOpen, toggle, close, triggerRef, menuRef };
}
