import type { ReactNode } from 'react';

/** Mark a value for highlighted rendering; empty values render as a muted placeholder. */
export function val(value: string, placeholder: string): string {
  const v = value.trim().replace(/\[\[|\]\]/g, '');
  return v ? `[[${v}]]` : `[[!${placeholder}]]`;
}

const TOKEN = /\*\*(.+?)\*\*|\[\[(!?)(.*?)\]\]|\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = i++;
    if (m[1] !== undefined) out.push(<strong key={key}>{m[1]}</strong>);
    else if (m[3] !== undefined) out.push(<span key={key} className={m[2] ? 'doc-ph' : 'doc-val'}>{m[3]}</span>);
    else out.push(<a key={key} href={m[5]} target="_blank" rel="noopener noreferrer">{m[4]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export interface TermsItem {
  number: string | null;
  text: string;
}

/** Parse the verbatim Standard Terms markdown into numbered paragraphs, substituting cover page values. */
export function parseTerms(source: string, links: Record<string, string>): { heading: string; items: TermsItem[] } {
  let heading = 'Standard Terms';
  const items: TermsItem[] = [];
  for (const raw of source.split(/\r?\n\r?\n/)) {
    const block = raw.trim();
    if (!block) continue;
    if (block.startsWith('# ')) {
      heading = block.slice(2);
      continue;
    }
    const text = block.replace(
      /<span class="coverpage_link">(.*?)<\/span>/g,
      (_, name: string) => links[name] ?? name,
    );
    const m = text.match(/^(\d+)\.\s+([\s\S]*)$/);
    items.push(m ? { number: m[1], text: m[2] } : { number: null, text });
  }
  return { heading, items };
}
