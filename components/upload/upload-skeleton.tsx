import BGGrid2 from "../ui/bg-pattern2";

export default function LoadingSkeletonUpload() {
  return (
    <section className="min-h-screen mx-auto max-w-7xl py-24 sm:py-32">
      <BGGrid2 />

      <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto my-2 text-center animate-pulse">
        <div className="w-full justify-items-center mb-10 mt-5 flex flex-col items-center">
          <div className="h-9 w-56 bg-gray-200/80 rounded-md mb-3" />
          <div className="h-5 w-80 bg-gray-200/60 rounded-md" />
        </div>

        <div className="w-full h-56 bg-gray-100/50 border-2 border-dashed border-gray-200 rounded-lg mb-5" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {Array.from({length: 4}).map((_, i) => (
            <div
              key={i}
              className="h-24 w-full bg-gray-100 border border-gray-200 rounded-lg"
            />
          ))}
        </div>

         <div className="w-full h-10 bg-gray-200 rounded-md mt-6" />
      </div>
    </section>
  );
}
