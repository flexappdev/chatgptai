"use client";

export function ReactPreview({ code }: { code: string }) {
  const srcDoc = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net https://cdn.tailwindcss.com data:; img-src * data: blob:;" />
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js" crossorigin></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>html,body,#root{margin:0;padding:0;background:#fff;color:#0d0d0d;font-family:system-ui,-apple-system,sans-serif;}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel" data-presets="env,react">
      try {
        ${code}
        const candidate = (typeof App !== "undefined" && App)
          || (typeof Component !== "undefined" && Component)
          || (typeof Page !== "undefined" && Page)
          || null;
        if (candidate) {
          ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(candidate));
        }
      } catch (e) {
        document.body.innerHTML = '<pre style="padding:16px;color:#b91c1c;font:13px ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;">' + (e && e.stack ? e.stack : String(e)) + '</pre>';
      }
    </script>
  </body>
</html>`;
  return (
    <iframe
      title="React preview"
      sandbox="allow-scripts"
      srcDoc={srcDoc}
      style={{ width: "100%", height: "100%", border: "none", background: "white" }}
    />
  );
}
