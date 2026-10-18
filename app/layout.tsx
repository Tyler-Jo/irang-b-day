import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "조이랑의 첫 번째 생일",
  description: "소중한 분들을 이랑이의 돌잔치에 초대합니다.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
