import Link from "next/link";
export function InteractiveCard({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} style={style} className={`${className} interactive-card`}>
      {children}
    </Link>
  );
}
