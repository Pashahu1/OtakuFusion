import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@/lib/utils';
import { useId, type ChangeEvent } from 'react';

interface EpisodeFindInputProps {
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export function EpisodeFindInput({
  onSearchChange,
  placeholder = 'Find by episode number…',
  className = '',
}: EpisodeFindInputProps) {
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'episode-find-input-wrap flex min-h-[2.75rem] min-w-0 flex-1 cursor-text items-center gap-x-3 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 transition-[border-color,box-shadow] focus-within:border-[#f47521]/40 focus-within:shadow-[0_0_0_1px_rgba(244,117,33,0.2)]',
        className
      )}
    >
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        className="pointer-events-none h-4 w-4 shrink-0 text-white/40"
        aria-hidden
      />
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-white placeholder:text-[13px] placeholder:text-white/35 placeholder:font-normal focus:outline-none"
        placeholder={placeholder}
        onChange={onSearchChange}
        aria-label={placeholder}
      />
    </label>
  );
}
