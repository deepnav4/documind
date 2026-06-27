import UploadForm from "@/components/upload/uploadform";
import BGGrid2 from "@/components/ui/bg-pattern2";
import userSummariesLength from "@/utils/summaries-length-for-user";

export default async function UploadPage() {
  const count = await userSummariesLength();
  return (
    <section className="min-h-screen mx-auto max-w-7xl py-14 sm:py-20 px-4 md:px-8">
      <BGGrid2 />
      <UploadForm initialCount={count} />
    </section>
  );
}
