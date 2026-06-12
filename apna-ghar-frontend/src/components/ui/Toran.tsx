const BEAD_COLORS = ["bg-marigold", "bg-flame", "bg-rani", "bg-teal"];

export default function Toran({ count = 9 }: { count?: number }) {
  return (
    <div aria-hidden className="flex justify-center gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`h-2.5 w-5 rounded-b-full ${BEAD_COLORS[i % BEAD_COLORS.length]}`}
        />
      ))}
    </div>
  );
}
