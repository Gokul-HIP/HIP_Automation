import { Poppins } from "next/font/google";
import { ThemeProvider } from "@wrksz/themes/next";
import { ThemeMotionProvider } from "@/components/theme/ThemeProvider";
import { UIProvider } from "@/context/UIContext";
import { AuthProvider } from "@/context/AuthContext";
import QueryProvider from "@/components/providers/QueryProvider";
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
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
          storageKey="crm-theme"
          themes={["light", "dark"]}
        >
          <ThemeMotionProvider>
            <UIProvider logo={logo}>
              <QueryProvider>
                <AuthProvider>{children}</AuthProvider>
              </QueryProvider>
            </UIProvider>
          </ThemeMotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
