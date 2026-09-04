import Image from 'next/image';
import bone from '@/public/logo-long-bone.png';
import navy from '@/public/logo-long-navy.png';

type LogoLongProps = {
  height?: number | string;
  className?: string;
};

/**
 /**
  * The landscape brand lockup, shipped as two color variants stacked on each other — the artwork is raster, so it
  * cannot ride `currentColor`. Which one shows is decided in globals.css, not here: the header's fill flips on both
  * `:hover` and `data-solid`, and only one of those is visible to React.
  */
export function LogoLong({ height = 32, className }: LogoLongProps) {
  return (
    <span className={`logo-long ${className ?? ''}`} style={{ height, aspectRatio: `${bone.width} / ${bone.height}` }}>
      {/* Both layers stay mounted so the hidden variant is not fetched on first hover. */}
      <Image src={bone} alt="" fill sizes="220px" priority className="logo-long__layer logo-long__layer--bone" />
      <Image src={navy} alt="" fill sizes="220px" priority className="logo-long__layer logo-long__layer--navy" />
    </span>
  );
}
