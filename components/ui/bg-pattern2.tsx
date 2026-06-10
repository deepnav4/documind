export default function BGGrid2() {
  return (
    <div
      className="min-h-screen w-full fixed inset-0 z-[-1] pointer-events-none 
                 bg-white dark:bg-black
                 [--grid-color:rgba(0,0,0,0.06)] 
                 [--dot-color:rgba(51,65,85,0.08)]
                 dark:[--grid-color:rgba(255,255,255,0.06)] 
                 dark:[--dot-color:rgba(148,163,184,0.12)]"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px),
            radial-gradient(circle, var(--dot-color) 1px, transparent 1px)
          `,
          backgroundSize: "30px 30px, 30px 30px, 30px 30px",
        }}
      />
    </div>
  );
}