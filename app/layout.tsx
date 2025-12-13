import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "GitMatch.ai",
    description: "Hire Developers Who Actually Understand Your Code",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-gh-bg text-gh-text-primary min-h-screen flex flex-col`} suppressHydrationWarning>
                <Navbar />
                <main className="flex-1 w-full max-w-7xl mx-auto px-6 pb-12">
                    {children}
                </main>
            </body>
        </html>
    );
}
