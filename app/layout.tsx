import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trio — Ask Once, Hear Three",
  description: "Compare Claude, Gemini, and GPT-4o side by side",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#080808" }}>
        {children}
      </body>
    </html>
  );
}
