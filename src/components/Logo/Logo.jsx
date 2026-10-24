import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function Logo({
  className = "",
  imageClassName = "",
  light = false,
  onClick,
}) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={`group flex items-center gap-3 ${className}`}
    >
      <img
        src={logo}
        alt="Plume"
        className={`${imageClassName || "h-[72px] w-44"} object-cover object-[center_40%] ${
          light ? "brightness-0 invert" : ""
        }`}
      />
    </Link>
  );
}
