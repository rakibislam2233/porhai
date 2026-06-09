import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
  height?: number;
  href?: string;
};

export function Logo({ className = "", height = 36, href = "/" }: LogoProps) {
  const image = (
    <Image
      src="/logo.png"
      alt="Logo"
      width={height * 3}
      height={height}
      className={`w-auto object-contain ${className}`}
      style={{ height }}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {image}
      </Link>
    );
  }

  return image;
}
