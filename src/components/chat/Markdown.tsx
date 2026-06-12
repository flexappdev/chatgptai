"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = { content: string };

export function Markdown({ content }: Props) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const inline = !className?.startsWith("language-");
            if (inline) {
              return (
                <code
                  style={{
                    background: "var(--code-bg)",
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.9em",
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            const lang = (className ?? "").replace("language-", "");
            const text = String(children).replace(/\n$/, "");
            return <CodeBlock language={lang} text={text} />;
          },
          a({ children, href, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--ok)", textDecoration: "underline" }}
                {...props}
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div style={{ overflowX: "auto", margin: "12px 0" }}>
                <table
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    fontSize: 14,
                  }}
                >
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th
                style={{
                  border: "1px solid var(--border)",
                  padding: "6px 10px",
                  textAlign: "left",
                  background: "var(--surface)",
                  fontWeight: 500,
                }}
              >
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td
                style={{
                  border: "1px solid var(--border)",
                  padding: "6px 10px",
                }}
              >
                {children}
              </td>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
      <style>{`
        .md p { margin: 0 0 12px; line-height: 1.65; }
        .md p:last-child { margin-bottom: 0; }
        .md h1, .md h2, .md h3, .md h4 {
          font-weight: 500;
          letter-spacing: -0.01em;
          margin: 18px 0 8px;
        }
        .md h1 { font-size: 22px; }
        .md h2 { font-size: 18px; }
        .md h3 { font-size: 16px; }
        .md ul, .md ol { margin: 0 0 12px; padding-left: 22px; }
        .md li { margin: 4px 0; line-height: 1.6; }
        .md blockquote {
          border-left: 3px solid var(--border-strong);
          margin: 12px 0;
          padding: 4px 14px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

function CodeBlock({ language, text }: { language: string; text: string }) {
  return (
    <div
      style={{
        background: "var(--code-bg)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        margin: "12px 0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 12px",
          borderBottom: "1px solid var(--border)",
          fontSize: 12,
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>{language || "code"}</span>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(text)}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "2px 8px",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: 11,
          }}
        >
          copy
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: 14,
          overflowX: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          lineHeight: 1.55,
          color: "var(--text)",
        }}
      >
        <code>{text}</code>
      </pre>
    </div>
  );
}
