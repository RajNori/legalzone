import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { MutualNdaGenerator } from './MutualNdaGenerator';

export const metadata = { title: 'Mutual NDA | LegalZone' };

export default async function MutualNdaPage() {
  // Standard Terms are kept verbatim (Common Paper Mutual-NDA.md); only cover page values are substituted.
  const termsSource = await readFile(path.join(process.cwd(), 'templates/mutual-nda/standard-terms.md'), 'utf8');
  return <MutualNdaGenerator termsSource={termsSource} />;
}
