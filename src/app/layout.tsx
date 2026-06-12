import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "chatgptai",
  description: "ChatGPT clone — chats, projects, canvas, skills, connectors.",
};

// Inline pre-paint script: read theme cookie before React mounts so we
// never flash the wrong colour scheme.
const themeBoot = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=([^;]+)/);var t=m?decodeURIComponent(m[1]):(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
