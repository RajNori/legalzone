# LegalZone

Interactive legal document generators (Next.js, TypeScript).

## Mutual NDA (KAN-1)

`/documents/mutual-nda` — form on the left, live preview on the right (Form/Preview toggle on mobile).
Based on the [Common Paper Mutual NDA](https://github.com/CommonPaper/Mutual-NDA) v1.0, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

### Architecture

- `lib/types.ts` — `DocumentTemplate<T>`: form schema, defaults, validation, cover page blocks, terms substitutions.
- `templates/mutual-nda/` — the NDA template (`index.ts`) and the **verbatim** Common Paper Standard Terms (`standard-terms.md`).
- `components/` — generic `DocumentGenerator`, `DocumentForm`, `DocumentPreview`; no NDA-specific logic.
- To add a document: create a `templates/<name>/` template and a route that renders `DocumentGenerator`.

```bash
npm install
npm run dev
npm run type-check
```
