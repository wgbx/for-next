import type { Metadata } from "next";
import { BackHomeLink } from "./BackHomeLink";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "for-next",
  description: "Next.js demos: cache, state, iframe embed debugging",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>
          <BackHomeLink />
          {children}
        </Providers>
      </body>
    </html>
  );
}
