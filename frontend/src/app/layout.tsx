import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StoreMaker - Build Your Dream Store",
  description: "Create and customize your ecommerce store with AI-powered templates. Build, manage, and grow your online business with StoreMaker.",
  keywords: ["ecommerce", "store builder", "online store", "templates", "ai", "shopify alternative"],
  authors: [{ name: "StoreMaker Team" }],
  creator: "StoreMaker",
  publisher: "StoreMaker",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://storemaker.com",
    title: "StoreMaker - Build Your Dream Store",
    description: "Create and customize your ecommerce store with AI-powered templates.",
    siteName: "StoreMaker",
  },
  twitter: {
    card: "summary_large_image",
    title: "StoreMaker - Build Your Dream Store",
    description: "Create and customize your ecommerce store with AI-powered templates.",
    creator: "@storemaker",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CartProvider>
              <main className="min-h-screen bg-white dark:bg-dark-950 text-gray-900 dark:text-gray-100">
                {children}
              </main>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                  },
                  className: 'dark:bg-dark-800 dark:text-gray-100',
                }}
              />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}