const FLAG_COLORS = ["bg-flame", "bg-sun", "bg-rani", "bg-teal"];

export default function Bunting() {
  return (
    <div aria-hidden className="flex origin-top motion-safe:animate-sway">
      {Array.from({ length: 16 }, (_, i) => (
        <span
          key={i}
          className={`h-5 flex-1 ${FLAG_COLORS[i % FLAG_COLORS.length]}`}
          style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
        />
      ))}
    </div>
  );
}
