import { parseTerms, renderInline } from '@/lib/markdown';
import type { DocBlock } from '@/lib/types';

interface Props {
  blocks: DocBlock[];
  termsSource: string;
  termsLinks: Record<string, string>;
  attribution: string;
}

function Block({ block }: { block: DocBlock }) {
  switch (block.type) {
    case 'title':
      return <h1>{block.text}</h1>;
    case 'heading':
      return block.level === 2 ? <h2>{block.text}</h2> : <h3>{block.text}</h3>;
    case 'paragraph':
      return <p>{renderInline(block.text)}</p>;
    case 'label':
      return <p className="doc-label">{block.text}</p>;
    case 'options':
      return (
        <ul className="doc-options">
          {block.options.map((o, i) => (
            <li key={i}>
              <span className="doc-check" aria-label={o.selected ? 'Selected' : 'Not selected'}>
                {o.selected ? '☒' : '☐'}
              </span>
              <span>{renderInline(o.text)}</span>
            </li>
          ))}
        </ul>
      );
    case 'signatures':
      return (
        <table className="doc-table">
          <thead>
            <tr>
              {block.headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((r) => (
              <tr key={r.label}>
                <th scope="row">
                  {r.label}
                  {r.note && <span className="doc-note">{r.note}</span>}
                </th>
                {r.cells.map((c, i) => (
                  <td key={i} className={r.label === 'Signature' ? 'doc-sig' : undefined}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'attribution':
      return <p className="doc-attribution">{renderInline(block.text)}</p>;
  }
}

export function DocumentPreview({ blocks, termsSource, termsLinks, attribution }: Props) {
  const terms = parseTerms(termsSource, termsLinks);
  return (
    <article className="doc" aria-label="Document preview">
      {blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
      <div className="doc-break" />
      <h2 className="doc-terms-heading">{terms.heading}</h2>
      <ol className="doc-terms">
        {terms.items.map((t, i) =>
          t.number ? (
            <li key={i} value={Number(t.number)}>
              {renderInline(t.text)}
            </li>
          ) : (
            <p key={i} className="doc-attribution">
              {renderInline(t.text)}
            </p>
          ),
        )}
      </ol>
      <p className="doc-license">{renderInline(attribution)}</p>
    </article>
  );
}
