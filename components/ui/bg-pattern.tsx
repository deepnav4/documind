export default function BGGrid() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      <div
        className="
          absolute inset-0
          [--grid-color:rgba(0,0,0,0.15)]
          dark:[--grid-color:rgba(255,255,255,0.1)]
        "
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `
            radial-gradient(ellipse 100% 100% at 50% 50%, black 10%, transparent 80%),
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            )
          `,
          WebkitMaskImage: `
            radial-gradient(ellipse 100% 100% at 50% 50%, black 10%, transparent 100%),
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            )
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
    </div>
  );
}