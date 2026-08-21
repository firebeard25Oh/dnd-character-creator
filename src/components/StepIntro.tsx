export function StepIntro({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="font-display text-xs uppercase tracking-[0.18em] text-brass">
        Step {step}
      </p>
      <h2 className="mt-1 font-display text-2xl text-oxblood-deep">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}
