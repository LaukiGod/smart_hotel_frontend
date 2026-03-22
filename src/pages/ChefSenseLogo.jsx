export default function ChefSenseLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" className="stroke-ember" strokeWidth="1" opacity="0.4" />
      <circle cx="20" cy="20" r="12" className="stroke-ember" strokeWidth="0.5" opacity="0.2" />
      <path
        d="M20 7 C20 7 28 12 28 20 C28 28 20 33 20 33 C20 33 12 28 12 20 C12 12 20 7 20 7Z"
        className="fill-ember"
        opacity="0.95"
      />
      <circle cx="20" cy="20" r="5" fill="hsl(220 14% 4% / 0.9)" />
      <circle cx="20" cy="20" r="2.5" className="fill-ember" />
      <line x1="20" y1="2" x2="20" y2="9" className="stroke-teal" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <line x1="20" y1="31" x2="20" y2="38" className="stroke-teal" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      <circle cx="20" cy="2" r="1.5" className="fill-teal" opacity="0.9" />
    </svg>
  );
}
