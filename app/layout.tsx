import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Source_Sans_3, Ubuntu } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Navbar } from "@/components/navbar/nav";
import { auth } from "@/utils/auth";
import "katex/dist/katex.min.css";
import { TooltipProvider } from "@/components/ui/tooltip";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const fontSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900']
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ['400']
})

const ubuntu = Ubuntu({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ['300', '400', '500', '700']
})
export const metadata: Metadata = {
  title: "DocuMind",
  description: "Turn your PDF into Ultimate study guide.",
  metadataBase: new URL("https://documind.fun"),
  openGraph: {
    title: "DocuMind",
    description: "Turn your PDF into Ultimate study guide.",
    url: "https://documind.fun",
    siteName: "DocuMind",
    images: [
      {
        url: "/preview.png", 
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "DocuMind",
    description: "Turn your PDF into Ultimate study guide.",
    images: ["/preview.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await auth();

  return (

      <html lang="en" suppressHydrationWarning>
        <body
          className={` ${ubuntu.className} thin-scrollbar`}
        >
          <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            
            <main className="flex-1">{children}</main>  
            <Toaster />
            
          </TooltipProvider>

          </ThemeProvider>
        </body>
      </html>

  );
}
