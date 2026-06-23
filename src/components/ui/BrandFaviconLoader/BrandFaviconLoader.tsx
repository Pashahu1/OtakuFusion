import Image from 'next/image';
import './BrandFaviconLoader.scss';

export function BrandFaviconLoader() {
  return (
    <div className="brand-favicon-loader" aria-hidden>
      <Image
        src="/icon.png"
        alt=""
        width={56}
        height={56}
        className="brand-favicon-loader__icon"
        priority
      />
    </div>
  );
}
