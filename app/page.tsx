import ChatBotOpenButton from "@/components/chatbot/chatbot-openButton";
import {FaqsSection} from "@/components/home/faqs";
import CTA from "@/components/home/cta";
import Footer from "@/components/home/footer";
import Hero from "@/components/home/hero";
import ScrollableCardStackDemo from "@/components/home/sections-stack";
import {SystemDesign} from "@/components/home/system-design";
import {Navbar} from "@/components/navbar/nav";
import BGGrid from "@/components/ui/bg-pattern";
import {auth} from "@/utils/auth";

export default async function Home() {
  const user = await auth();
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden flex flex-col items-center">
      <Navbar user={user} />
      <BGGrid />
      <div className="w-[94%] sm:w-[96%] md:w-full max-w-7xl mx-auto flex flex-col items-center">
        <div className="mt-8 md:mt-16 w-full">
          <Hero />
        </div>
        <div id="example-output" className="w-full mt-10 md:mt-0">
          <ScrollableCardStackDemo />
        </div>
        <div className="flex justify-center -mb-10 md:-mb-20 w-full px-2 mx-2 md:px-0">
          <FaqsSection />
        </div>
        <div className="flex justify-center mt-10 md:mt-24 w-full">
          <SystemDesign />
        </div>
        <CTA />
      </div>
      <Footer />
      <ChatBotOpenButton />
    </div>
  );
}
