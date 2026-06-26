
export default function LoadingSkeletonDashboard() {
    return <main className="min-h-screen relative">

      <div className="relative container mx-auto flex flex-col gap-4 md:w-4/5 w-[98%]">
        <div className="px-2 py-12 sm:py-24">
          <div className="flex gap-4 mb-8 justify-between">
            <div className="flex flex-col gap-2">
              <div className="h-8 w-48 rounded bg-gray-100 dark:bg-zinc-900 animate-pulse" />
              <div className="h-5 w-64 rounded bg-gray-100 dark:bg-zinc-900 animate-pulse" />
            </div>
            <div className="h-10 w-36 rounded-lg bg-gray-100 dark:bg-zinc-900 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 sm:px-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 w-full rounded-xl bg-gray-100 dark:bg-zinc-900 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
}