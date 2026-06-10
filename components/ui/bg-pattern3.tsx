export default function BGGrid3() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-black fixed inset-0 z-[-1] pointer-events-none">
      
      {/* Grid Layer */}
      <div
        className="
          absolute inset-0 z-0
          [background-size:20px_20px]
          [background-position:0_0]
          
          /* Light mode grid */
          bg-[linear-gradient(to_right,#e7e5e4_1px,transparent_1.5px),linear-gradient(to_bottom,#e7e5e4_1px,transparent_1.5px)]
          
          /* Dark mode grid */
          dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1.5px),linear-gradient(to_bottom,#27272a_1px,transparent_1.5px)]
        "
        style={{
          maskImage: `
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
            ),
            radial-gradient(ellipse 80% 80% at 0% 0%, #000 55%, transparent 95%)
          `,
          WebkitMaskImage: `
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
            ),
            radial-gradient(ellipse 80% 80% at 0% 0%, #000 65%, transparent 95%)
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
    </div>
  );
}