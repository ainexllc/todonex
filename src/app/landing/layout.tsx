import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata: Metadata = {
  title: "NextTaskPro - AI-Powered Task Management",
  description: "Transform your productivity with AI-powered task management. Create, organize, and complete tasks using natural language processing.",
  keywords: ["task management", "AI assistant", "productivity", "natural language", "smart planning", "team collaboration"],
  authors: [{ name: "NextTaskPro Team" }],
  creator: "NextTaskPro",
  publisher: "NextTaskPro",
  openGraph: {
    title: "NextTaskPro - AI-Powered Task Management",
    description: "Transform your productivity with AI-powered task management. Create, organize, and complete tasks using natural language processing.",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextTaskPro - AI-Powered Task Management",
    description: "Transform your productivity with AI-powered task management. Create, organize, and complete tasks using natural language processing.",
    images: ["/og-image.png"],
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-gray-950 text-white flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}