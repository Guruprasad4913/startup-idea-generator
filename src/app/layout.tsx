import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StartupGen & Validator — AI + API + Cloud Intelligence",
  description:
    "Generate, validate, and stress-test startup concepts using Artificial Intelligence, real-time market APIs, and Cloud Computing architecture blueprints.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080c14] text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white antialiased">
        <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0"></div>
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
