import {Metadata} from "next";
import {Urbanist} from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";

const urbanist = Urbanist({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "UD Bumi Subur",
    description: "UD Bumi Subur",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={urbanist.className}>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
