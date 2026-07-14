import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { UIProvider } from "@/context/UIContext";
import { getLogo } from "@/services/uiService";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: "HIP Automation CRM",
  description: "Modern CRM dashboard for inbox, automation, and chatbot operations.",
};

export default async function RootLayout({ children }) {
  let logo = null;

  try {
    logo = await getLogo();
  } catch {
    logo = null;
  }

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={poppins.className}>
        <ThemeProvider>
          <UIProvider logo={logo}>{children}</UIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
