'use client';

import { DocumentGenerator } from '@/components/DocumentGenerator';
import { mutualNda } from '@/templates/mutual-nda';

// Template objects hold functions, so they are bound on the client; only the terms text crosses the boundary.
export function MutualNdaGenerator({ termsSource }: { termsSource: string }) {
  return <DocumentGenerator template={mutualNda} termsSource={termsSource} />;
}
