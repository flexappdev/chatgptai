"use client";

export function MermaidPreview({ code }: { code: string }) {
  const srcDoc = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: false, theme: "default" });
      const el = document.getElementById("d");
      try {
        const { svg } = await mermaid.render("g", el.textContent.trim());
        el.innerHTML = svg;
      } catch (e) {
        el.innerHTML = '<pre style="color:#b91c1c;padding:16px;">' + (e && e.message ? e.message : String(e)) + '</pre>';
      }
    </script>
    <style>html,body{margin:0;padding:16px;background:#fff;color:#0d0d0d;font-family:system-ui;}#d{display:flex;justify-content:center;}</style>
  </head>
  <body>
    <div id="d">${escapeHtml(code)}</div>
  </body>
</html>`;
  return (
    <iframe
      title="Mermaid preview"
      sandbox="allow-scripts"
      srcDoc={srcDoc}
      style={{ width: "100%", height: "100%", border: "none", background: "white" }}
    />
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
