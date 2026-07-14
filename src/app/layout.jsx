import { DM_Sans } from "next/font/google";
import { UIProvider } from "@/context/UIContext";
import "./globals.css";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "HIP Automation CRM",
  description: "Modern CRM dashboard for inbox, automation, and chatbot operations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={poppins.className}>
        <UIProvider>{children}</UIProvider>
      </body>
    </html>
  );
}
