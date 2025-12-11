import * as FaIcons from "react-icons/fa";
import * as GiIcons from "react-icons/gi";

export default function SportIcon({ icon }) {
  const Icon =
    FaIcons[icon] ||
    GiIcons[icon] ||
    FaIcons["FaQuestion"]; // fallback

  return <Icon size={28} className="text-blue-600" />;
}
