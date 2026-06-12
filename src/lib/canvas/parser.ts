// Incremental textdoc parser.
// The model emits <textdoc identifier="..." type="..." title="..." language="...">…</textdoc>.
// Deltas may split a tag across chunk boundaries; this parser tolerates that.

export type CanvasType =
  | "document"
  | "code"
  | "react"
  | "html"
  | "svg"
  | "mermaid";

export type TextdocAttrs = {
  identifier: string;
  type: CanvasType;
  title?: string;
  language?: string;
};

export type ParserEvent =
  | { kind: "text"; text: string }
  | { kind: "canvas_open"; attrs: TextdocAttrs }
  | { kind: "canvas_delta"; text: string }
  | { kind: "canvas_close" };

type State = "text" | "in_open_tag" | "in_canvas" | "in_close_tag";

const OPEN_TAG_RE = /^<textdoc\b/;

function parseAttrs(tag: string): TextdocAttrs | null {
  // tag = '<textdoc identifier="..." type="..." ...>'
  const attrs: Record<string, string> = {};
  const re = /(\w+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(tag)) !== null) {
    attrs[m[1]!] = m[2]!;
  }
  if (!attrs.identifier || !attrs.type) return null;
  const allowed = new Set(["document", "code", "react", "html", "svg", "mermaid"]);
  if (!allowed.has(attrs.type)) return null;
  return {
    identifier: attrs.identifier,
    type: attrs.type as CanvasType,
    title: attrs.title,
    language: attrs.language,
  };
}

export class TextdocStreamParser {
  private buf = "";
  private state: State = "text";
  private events: ParserEvent[] = [];

  push(delta: string): ParserEvent[] {
    this.events = [];
    this.buf += delta;

    while (true) {
      if (this.state === "text") {
        const lt = this.buf.indexOf("<");
        if (lt === -1) {
          if (this.buf.length > 0) {
            this.events.push({ kind: "text", text: this.buf });
            this.buf = "";
          }
          break;
        }
        // Emit text before the '<'
        if (lt > 0) {
          this.events.push({ kind: "text", text: this.buf.slice(0, lt) });
          this.buf = this.buf.slice(lt);
        }
        // Could be start of <textdoc — wait until we have enough to know
        if (this.buf.length < "<textdoc".length) {
          // not enough yet
          break;
        }
        if (this.buf.startsWith("<textdoc")) {
          this.state = "in_open_tag";
          continue;
        }
        // Not a textdoc — emit the '<' and continue
        this.events.push({ kind: "text", text: this.buf[0]! });
        this.buf = this.buf.slice(1);
        continue;
      }

      if (this.state === "in_open_tag") {
        const gt = this.buf.indexOf(">");
        if (gt === -1) break; // need more
        const tag = this.buf.slice(0, gt + 1);
        const attrs = parseAttrs(tag);
        this.buf = this.buf.slice(gt + 1);
        if (attrs) {
          this.events.push({ kind: "canvas_open", attrs });
          this.state = "in_canvas";
        } else {
          // Bad tag — emit as text
          this.events.push({ kind: "text", text: tag });
          this.state = "text";
        }
        continue;
      }

      if (this.state === "in_canvas") {
        const closeIdx = this.buf.indexOf("</textdoc>");
        if (closeIdx === -1) {
          // Possible split close tag — keep last 10 chars in buffer, emit rest.
          const safe = Math.max(0, this.buf.length - "</textdoc>".length);
          if (safe > 0) {
            this.events.push({ kind: "canvas_delta", text: this.buf.slice(0, safe) });
            this.buf = this.buf.slice(safe);
          }
          break;
        }
        if (closeIdx > 0) {
          this.events.push({ kind: "canvas_delta", text: this.buf.slice(0, closeIdx) });
        }
        this.buf = this.buf.slice(closeIdx + "</textdoc>".length);
        this.events.push({ kind: "canvas_close" });
        this.state = "text";
        continue;
      }

      // unreachable
      break;
    }

    return this.events;
  }

  flush(): ParserEvent[] {
    const events: ParserEvent[] = [];
    if (this.state === "text" && this.buf.length > 0) {
      events.push({ kind: "text", text: this.buf });
      this.buf = "";
    } else if (this.state === "in_canvas" && this.buf.length > 0) {
      events.push({ kind: "canvas_delta", text: this.buf });
      events.push({ kind: "canvas_close" });
      this.buf = "";
      this.state = "text";
    }
    return events;
  }
}
