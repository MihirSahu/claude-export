import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "claude-export | Archive Claude conversations as Markdown",
  description:
    "Export Claude conversations to Markdown with dated folders, readable transcripts, frontmatter, timestamps, and tool calls preserved for knowledge bases.",
  applicationName: "claude-export",
  openGraph: {
    title: "claude-export | Archive Claude conversations as Markdown",
    description:
      "Export Claude conversations to Markdown with dated folders, readable transcripts, frontmatter, timestamps, and tool calls preserved for knowledge bases.",
    siteName: "claude-export",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "claude-export | Archive Claude conversations as Markdown",
    description:
      "Export Claude conversations to Markdown with dated folders, readable transcripts, frontmatter, timestamps, and tool calls preserved for knowledge bases."
  }
};

export const viewport: Viewport = {
  themeColor: "#f5f4ed"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={mono.variable}>
      <body>{children}</body>
    </html>
  );
}
