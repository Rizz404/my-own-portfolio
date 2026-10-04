import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "a",
  "hr",
];
const ALLOWED_ATTR = ["href", "target", "rel"];

// * Semua link hasil editor dipaksa buka di tab baru + noopener, biar gak bergantung sama
// atribut yang kebetulan tersimpan di HTML-nya.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}

const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

// * Deteksi teks yang isinya markup HTML mentah (mis. disalin dari file/editor kode): harus
// diawali tag buka & diakhiri tag tutup, biar kalimat biasa yang kebetulan nyebut "<b>" gak ikut kena.
export function looksLikeHtml(text: string): boolean {
  const value = text.trim();
  return value.startsWith("<") && value.endsWith(">") && HTML_TAG_PATTERN.test(value);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// * Description lama disimpan sebagai plain text (kadang dengan "\n" literal, bukan newline
// asli, dari seed data) - kalau gak ada tag HTML sama sekali, bungkus jadi paragraf biar
// tampilannya sama rapinya dengan konten hasil editor.
export function toDisplayHtml(raw: string | null | undefined): string {
  const value = raw?.trim();
  if (!value) return "";
  if (HTML_TAG_PATTERN.test(value)) return sanitizeHtml(value);

  const normalized = value.replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`);
  return sanitizeHtml(paragraphs.join(""));
}

// * Buat preview singkat di kartu (line-clamp) - strip tag, sisakan teks polos.
export function htmlToPlainText(raw: string | null | undefined): string {
  const html = toDisplayHtml(raw);
  if (!html) return "";
  const doc = new DOMParser().parseFromString(
    html.replace(/<\/(p|li|h2|h3|blockquote|pre)>/gi, " </$1>").replace(/<br\s*\/?>/gi, " "),
    "text/html",
  );
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}
