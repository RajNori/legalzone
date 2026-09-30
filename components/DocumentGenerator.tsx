'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DocumentTemplate } from '@/lib/types';
import { DocumentForm } from './DocumentForm';
import { DocumentPreview } from './DocumentPreview';

interface Props<T extends object> {
  template: DocumentTemplate<T>;
  termsSource: string;
}

const today = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export function DocumentGenerator<T extends object>({ template, termsSource }: Props<T>) {
  const [data, setData] = useState<T>(template.defaults);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'form' | 'preview'>('form');

  // Default the Effective Date to today on the client (avoids SSR/client date mismatch).
  useEffect(() => {
    setData((d) => {
      const r = d as Record<string, unknown>;
      return 'effectiveDate' in r && !r.effectiveDate ? ({ ...d, effectiveDate: today() } as T) : d;
    });
  }, []);

  const errors = useMemo(() => template.validate(data), [template, data]);
  const remaining = Object.keys(errors).length;
  const blocks = useMemo(() => template.renderCoverPage(data), [template, data]);
  const links = useMemo(() => template.termsLinks(data), [template, data]);

  const onChange = (name: string, value: string) => setData((d) => ({ ...d, [name]: value }));
  const onBlur = (name: string) => setTouched((t) => (t.has(name) ? t : new Set(t).add(name)));
  const revealAll = () => setTouched(new Set(Object.keys(errors)));

  return (
    <div className="generator" data-view={view}>
      <header className="gen-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">L</span>
          LegalZone
        </div>
        <div className="crumbs">
          <span>Documents</span>
          <span aria-hidden="true">/</span>
          <strong>{template.title}</strong>
        </div>
        <div className="gen-status">
          <span className={remaining ? 'badge warn' : 'badge ok'}>
            {remaining ? `${remaining} required field${remaining === 1 ? '' : 's'} remaining` : 'All required fields complete'}
          </span>
          {remaining > 0 && (
            <button type="button" className="link-btn" onClick={revealAll}>
              Show
            </button>
          )}
        </div>
        <div className="view-toggle" role="tablist" aria-label="Mobile view">
          <button role="tab" aria-selected={view === 'form'} onClick={() => setView('form')}>
            Form
          </button>
          <button role="tab" aria-selected={view === 'preview'} onClick={() => setView('preview')}>
            Preview
          </button>
        </div>
      </header>
      <div className="gen-body">
        <div className="pane form-pane">
          <DocumentForm
            sections={template.sections}
            data={data}
            errors={errors}
            touched={touched}
            onChange={onChange}
            onBlur={onBlur}
          />
        </div>
        <div className="pane preview-pane">
          <DocumentPreview
            blocks={blocks}
            termsSource={termsSource}
            termsLinks={links}
            attribution={template.attribution}
          />
        </div>
      </div>
    </div>
  );
}
