import type { TagItem } from '@/shared/types/WatchPageTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function Tag({
  bgColor,
  index,
  icon,
  text,
}: {
  bgColor: string;
  index: number;
  icon?: TagItem['icon'];
  text?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center space-x-1 px-[4px] py-[1px] text-[13px] font-semibold text-black ${
        index === 0 ? 'rounded-l-[4px]' : 'rounded-none'
      }`}
      style={{ backgroundColor: bgColor }}
    >
      {icon && <FontAwesomeIcon icon={icon} className="text-[12px]" />}
      <p className="text-[12px]">{text}</p>
    </div>
  );
}
