/**
 * RichText — lightweight Markdown-lite renderer (no external deps).
 *
 * Supported syntax:
 *   **bold**          → <strong>
 *   *italic*          → <em>
 *   _italic_          → <em>
 *   `code`            → <code>
 *   - item / * item   → <ul><li> (each line = one bullet)
 *   blank line        → paragraph break
 */

import React from "react";

export type RichTextClasses = {
  wrapper?: string;
  p?: string;
  ul?: string;
  li?: string;
  /** Bullet dot/marker rendered before each list item */
  bullet?: string;
  strong?: string;
  em?: string;
  code?: string;
};

// ── Inline renderer ────────────────────────────────────────────────────────
function renderInline(
  text: string,
  classes: RichTextClasses,
  keyPrefix: string
): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key} className={classes.strong}>{part.slice(2, -2)}</strong>;
    }
    if (
      ((part.startsWith("*") && part.endsWith("*")) ||
        (part.startsWith("_") && part.endsWith("_"))) &&
      part.length > 2
    ) {
      return <em key={key} className={classes.em}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={key} className={classes.code}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

// ── Block renderer ─────────────────────────────────────────────────────────
function renderBlock(
  block: string,
  classes: RichTextClasses,
  blockIndex: number
): React.ReactNode {
  // Split on \n (already stripped \r before calling)
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

  // A block is a list if EVERY non-empty line starts with "- " or "* "
  const isList = lines.length > 0 && lines.every((l) => /^[-*] /.test(l));

  if (isList) {
    return (
      <ul key={blockIndex} className={classes.ul}>
        {lines.map((l, i) => {
          const text = l.replace(/^[-*] /, "");
          return (
            <li key={i} className={classes.li}>
              <span className={classes.bullet} aria-hidden>•</span>
              <span>{renderInline(text, classes, `${blockIndex}-li-${i}`)}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  // Mixed block: some lines may be bullets, others prose — render line-by-line
  // (handles the case where bullet items aren't separated from prose by a blank line)
  const hasSomeBullets = lines.some((l) => /^[-*] /.test(l));
  if (hasSomeBullets) {
    return (
      <div key={blockIndex}>
        {lines.map((l, i) => {
          if (/^[-*] /.test(l)) {
            const text = l.replace(/^[-*] /, "");
            return (
              <div key={i} className={classes.li} style={{ display: "flex", gap: "0.5rem" }}>
                <span className={classes.bullet} aria-hidden>•</span>
                <span>{renderInline(text, classes, `${blockIndex}-mix-${i}`)}</span>
              </div>
            );
          }
          return (
            <p key={i} className={classes.p}>
              {renderInline(l, classes, `${blockIndex}-prose-${i}`)}
            </p>
          );
        })}
      </div>
    );
  }

  // Plain paragraph — join lines with a space
  const joined = lines.join(" ");
  return (
    <p key={blockIndex} className={classes.p}>
      {renderInline(joined, classes, `${blockIndex}-p`)}
    </p>
  );
}

// ── Public component ───────────────────────────────────────────────────────
export default function RichText({
  content,
  classes = {},
}: {
  content: string;
  classes?: RichTextClasses;
}) {
  if (!content?.trim()) return null;

  // Normalise line endings (Windows \r\n → \n, lone \r → \n)
  const normalised = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Split into blocks on one or more blank lines
  const blocks = normalised
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className={classes.wrapper}>
      {blocks.map((block, i) => renderBlock(block, classes, i))}
    </div>
  );
}
