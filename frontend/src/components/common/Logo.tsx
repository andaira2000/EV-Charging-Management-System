import Image from "next/image";

// The EV logo (black artwork, inverted in dark mode) with the app name as text.
const Logo = ({
  size = 40,
  showName = true,
}: {
  size?: number;
  showName?: boolean;
}) => (
  <span className="inline-flex items-center gap-2.5">
    <Image
      src="/images/logo/ev-logo.svg"
      alt="EV Charging logo"
      width={Math.round((size * 683) / 570)}
      height={size}
      priority
      className="dark:invert"
    />
    {showName && (
      <span className="metallic-text text-xl font-extrabold leading-none">
        EV Charging
      </span>
    )}
  </span>
);

export default Logo;
