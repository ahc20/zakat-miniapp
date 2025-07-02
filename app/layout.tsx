import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: "Zakat MiniApp",
    description: "Calculate and pay Zakat on crypto assets automatically according to Islamic jurisprudence. Built on Base with gasless transactions.",
    icons: {
      icon: [
        {
          url: "/base-logo.png",
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: "/base-logo.png",
          sizes: "16x16",
          type: "image/png",
        },
      ],
      apple: "/base-logo.png",
    },
    openGraph: {
      title: "Zakat MiniApp",
      description: "Calculate and pay Zakat on crypto assets automatically according to Islamic jurisprudence. Built on Base with gasless transactions.",
      url: URL,
      siteName: "Zakat MiniApp",
      images: [
        {
          url: "/base-logo.png",
          width: 1200,
          height: 630,
          alt: "Zakat MiniApp - Base Logo",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Zakat MiniApp",
      description: "Calculate and pay Zakat on crypto assets automatically according to Islamic jurisprudence. Built on Base with gasless transactions.",
      images: ["/base-logo.png"],
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
        button: {
          title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
          action: {
            type: "launch_frame",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE,
            splashBackgroundColor:
              process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
