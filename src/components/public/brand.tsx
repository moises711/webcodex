import Image from "next/image";
import defaultLogo from "../../../public/resources/images/codex-cusco-logo.png";
export function Brand({
  large = false,
  src = "/resources/images/codex-cusco-logo.png",
  name = "Códex Cusco",
}: {
  large?: boolean;
  src?: string;
  name?: string;
}) {
  return (
    <div
      className={large ? "brand-image brand-large" : "brand-image"}
      style={{ background: "transparent", aspectRatio: "3" }}
    >
      <Image
        src={
          src === "/resources/images/codex-cusco-logo.png" ||
          src === "/brand/codex-cusco.jpeg" ||
          src === "/resources/images/codex-cusco.jpeg"
            ? defaultLogo
            : src
        }
        alt={name}
        fill
        unoptimized={src.startsWith("/api/media/")}
        sizes={large ? "(max-width:768px) 85vw, 480px" : "180px"}
        preload={large}
        loading="eager"
        className="logo"
      />
    </div>
  );
}
