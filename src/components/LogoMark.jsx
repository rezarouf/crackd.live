export default function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M40 4 L70 21 L70 55 L40 72 L10 55 L10 21 Z" stroke="rgba(245,166,35,0.3)" strokeWidth="1.5" fill="rgba(245,166,35,0.05)" />
      <path d="M40 4 L70 21 L70 55 L40 72 L10 55 L10 21 Z" stroke="#F5A623" strokeWidth="2" fill="none" strokeDasharray="4 60" strokeDashoffset="0" />
      <path d="M40 15 L44 32 L52 28 L40 65 L36 45 L28 50 Z" fill="#F5A623" opacity="0.9" />
      <circle cx="40" cy="40" r="4" fill="#0D0F14" />
    </svg>
  );
}
