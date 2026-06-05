import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prime Range Outdoor Society Inc.",
  description:
    "A private outdoor society for members who value responsible recreation, safety, community, and respect for the outdoors.",
  icons: {
    icon: "/images/pros-badge.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
