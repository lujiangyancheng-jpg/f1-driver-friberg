import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "弗一把 · F1 车手猜测游戏",
  description: "猜出隐藏的 F1 车手，读懂每一条数据。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
