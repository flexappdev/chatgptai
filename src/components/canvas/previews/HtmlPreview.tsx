"use client";

export function HtmlPreview({ html }: { html: string }) {
  return (
    <iframe
      title="HTML preview"
      sandbox="allow-scripts"
      srcDoc={html}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        background: "white",
      }}
    />
  );
}
