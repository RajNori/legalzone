import { val } from '@/lib/markdown';
import type { DocBlock, DocumentTemplate, FormErrors, FormSection } from '@/lib/types';

export interface NdaData {
  purpose: string;
  effectiveDate: string; // yyyy-mm-dd
  termType: 'expires' | 'until-terminated';
  termYears: string;
  confType: 'years' | 'perpetuity';
  confYears: string;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  p1Name: string;
  p1Title: string;
  p1Company: string;
  p1Address: string;
  p1Date: string;
  p2Name: string;
  p2Title: string;
  p2Company: string;
  p2Address: string;
  p2Date: string;
}

export const ndaDefaults: NdaData = {
  purpose: 'Evaluating whether to enter into a business relationship with the other party.',
  effectiveDate: '',
  termType: 'expires',
  termYears: '1',
  confType: 'years',
  confYears: '1',
  governingLaw: '',
  jurisdiction: '',
  modifications: '',
  p1Name: '',
  p1Title: '',
  p1Company: '',
  p1Address: '',
  p1Date: '',
  p2Name: '',
  p2Title: '',
  p2Company: '',
  p2Address: '',
  p2Date: '',
};

const ADDRESS_HELP = 'Use either email or postal address';

function partySection(n: 1 | 2): FormSection<NdaData> {
  const k = (s: string) => `p${n}${s}` as keyof NdaData & string;
  return {
    id: `party${n}`,
    title: `Party ${n}`,
    items: [
      { kind: 'field', field: { name: k('Name'), label: 'Print Name', type: 'text', required: true } },
      { kind: 'field', field: { name: k('Title'), label: 'Title', type: 'text', required: true } },
      { kind: 'field', field: { name: k('Company'), label: 'Company', type: 'text', required: true } },
      {
        kind: 'field',
        field: { name: k('Address'), label: 'Notice Address', type: 'textarea', required: true, help: ADDRESS_HELP },
      },
      { kind: 'field', field: { name: k('Date'), label: 'Date', type: 'date' } },
    ],
  };
}

const sections: FormSection<NdaData>[] = [
  {
    id: 'agreement',
    title: 'Agreement Details',
    items: [
      {
        kind: 'field',
        field: {
          name: 'purpose',
          label: 'Purpose',
          type: 'textarea',
          required: true,
          help: 'How Confidential Information may be used',
        },
      },
      { kind: 'field', field: { name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true } },
    ],
  },
  {
    id: 'term',
    title: 'NDA Term',
    items: [
      {
        kind: 'choice',
        name: 'termType',
        label: 'MNDA Term',
        help: 'The length of this MNDA',
        options: [
          { value: 'expires', label: 'Expires', numberField: { name: 'termYears', suffix: 'year(s) from Effective Date' } },
          { value: 'until-terminated', label: 'Continues until terminated in accordance with the terms of the MNDA' },
        ],
      },
    ],
  },
  {
    id: 'confidentiality',
    title: 'Confidentiality',
    items: [
      {
        kind: 'choice',
        name: 'confType',
        label: 'Term of Confidentiality',
        help: 'How long Confidential Information is protected',
        options: [
          { value: 'years', label: '', numberField: { name: 'confYears', suffix: 'year(s) from Effective Date' } },
          { value: 'perpetuity', label: 'In perpetuity' },
        ],
      },
    ],
  },
  {
    id: 'law',
    title: 'Governing Law',
    items: [
      {
        kind: 'field',
        field: { name: 'governingLaw', label: 'Governing Law (state)', type: 'text', required: true, placeholder: 'e.g. Delaware' },
      },
      {
        kind: 'field',
        field: {
          name: 'jurisdiction',
          label: 'Jurisdiction',
          type: 'text',
          required: true,
          placeholder: 'e.g. New Castle, DE',
          help: 'City or county and state, i.e. “courts located in New Castle, DE”',
        },
      },
    ],
  },
  {
    id: 'mods',
    title: 'Modifications',
    items: [
      {
        kind: 'field',
        field: { name: 'modifications', label: 'Modifications', type: 'textarea', help: 'List any modifications to the MNDA (optional)' },
      },
    ],
  },
  partySection(1),
  partySection(2),
];

const REQUIRED: [keyof NdaData, string][] = [
  ['purpose', 'Purpose'],
  ['effectiveDate', 'Effective Date'],
  ['governingLaw', 'Governing Law'],
  ['jurisdiction', 'Jurisdiction'],
  ['p1Name', 'Print Name'],
  ['p1Title', 'Title'],
  ['p1Company', 'Company'],
  ['p1Address', 'Notice Address'],
  ['p2Name', 'Print Name'],
  ['p2Title', 'Title'],
  ['p2Company', 'Company'],
  ['p2Address', 'Notice Address'],
];

function validate(d: NdaData): FormErrors<NdaData> {
  const errors: FormErrors<NdaData> = {};
  for (const [key, label] of REQUIRED) {
    if (!d[key].trim()) errors[key] = `${label} is required`;
  }
  const years = (s: string) => /^\d+$/.test(s.trim()) && Number(s) >= 1;
  if (d.termType === 'expires' && !years(d.termYears)) errors.termYears = 'Enter a whole number of years (1 or more)';
  if (d.confType === 'years' && !years(d.confYears)) errors.confYears = 'Enter a whole number of years (1 or more)';
  return errors;
}

export function formatDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

const years = (n: string) => `${n.trim() || '___'} year(s)`;

function termText(d: NdaData): string {
  return d.termType === 'expires'
    ? `Expires ${years(d.termYears)} from Effective Date.`
    : 'Continues until terminated in accordance with the terms of the MNDA.';
}

function confText(d: NdaData): string {
  return d.confType === 'years'
    ? `${years(d.confYears)} from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
    : 'In perpetuity.';
}

function renderCoverPage(d: NdaData): DocBlock[] {
  const blocks: DocBlock[] = [
    { type: 'title', text: 'Mutual Non-Disclosure Agreement' },
    { type: 'heading', level: 2, text: 'USING THIS MUTUAL NON-DISCLOSURE AGREEMENT' },
    {
      type: 'paragraph',
      text: 'This Mutual Non-Disclosure Agreement (the “MNDA”) consists of: (1) this Cover Page (“**Cover Page**”) and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 (“**Standard Terms**”) identical to those posted at [commonpaper.com/standards/mutual-nda/1.0](https://commonpaper.com/standards/mutual-nda/1.0). Any modifications of the Standard Terms should be made on the Cover Page, which will control over conflicts with the Standard Terms.',
    },
    { type: 'heading', level: 3, text: 'Purpose' },
    { type: 'label', text: 'How Confidential Information may be used' },
    { type: 'paragraph', text: val(d.purpose, 'Evaluating whether to enter into a business relationship with the other party.') },
    { type: 'heading', level: 3, text: 'Effective Date' },
    { type: 'paragraph', text: val(formatDate(d.effectiveDate), 'Today’s date') },
    { type: 'heading', level: 3, text: 'MNDA Term' },
    { type: 'label', text: 'The length of this MNDA' },
    {
      type: 'options',
      options: [
        { selected: d.termType === 'expires', text: `Expires ${d.termType === 'expires' ? val(d.termYears.trim() ? `${d.termYears.trim()} year(s)` : '', '1 year(s)') : '[ ] year(s)'} from Effective Date.` },
        { selected: d.termType === 'until-terminated', text: 'Continues until terminated in accordance with the terms of the MNDA.' },
      ],
    },
    { type: 'heading', level: 3, text: 'Term of Confidentiality' },
    { type: 'label', text: 'How long Confidential Information is protected' },
    {
      type: 'options',
      options: [
        {
          selected: d.confType === 'years',
          text: `${d.confType === 'years' ? val(d.confYears.trim() ? `${d.confYears.trim()} year(s)` : '', '1 year(s)') : '[ ] year(s)'} from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`,
        },
        { selected: d.confType === 'perpetuity', text: 'In perpetuity.' },
      ],
    },
    { type: 'heading', level: 3, text: 'Governing Law & Jurisdiction' },
    { type: 'paragraph', text: `Governing Law: ${val(d.governingLaw, 'Fill in state')}` },
    {
      type: 'paragraph',
      text: `Jurisdiction: ${val(d.jurisdiction, 'Fill in city or county and state, i.e. “courts located in New Castle, DE”')}`,
    },
    { type: 'heading', level: 3, text: 'MNDA Modifications' },
    { type: 'paragraph', text: d.modifications.trim() ? val(d.modifications, '') : 'List any modifications to the MNDA' },
    { type: 'paragraph', text: 'By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.' },
    {
      type: 'signatures',
      headers: ['', 'PARTY 1', 'PARTY 2'],
      rows: [
        { label: 'Signature', cells: ['', ''] },
        { label: 'Print Name', cells: [d.p1Name, d.p2Name] },
        { label: 'Title', cells: [d.p1Title, d.p2Title] },
        { label: 'Company', cells: [d.p1Company, d.p2Company] },
        { label: 'Notice Address', note: 'Use either email or postal address', cells: [d.p1Address, d.p2Address] },
        { label: 'Date', cells: [formatDate(d.p1Date), formatDate(d.p2Date)] },
      ],
    },
    {
      type: 'attribution',
      text: 'Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
  ];
  return blocks;
}

export const mutualNda: DocumentTemplate<NdaData> = {
  id: 'mutual-nda',
  title: 'Mutual Non-Disclosure Agreement',
  attribution:
    'Based on the [Common Paper Mutual NDA](https://github.com/CommonPaper/Mutual-NDA) (Version 1.0), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
  sections,
  defaults: ndaDefaults,
  validate,
  renderCoverPage,
  termsLinks: (d) => ({
    Purpose: val(d.purpose, 'Purpose'),
    'Effective Date': val(formatDate(d.effectiveDate), 'Effective Date'),
    'MNDA Term': val(termText(d).replace(/\.$/, ''), 'MNDA Term'),
    'Term of Confidentiality': val(confText(d).replace(/\.$/, ''), 'Term of Confidentiality'),
    'Governing Law': val(d.governingLaw, 'Governing Law'),
    Jurisdiction: val(d.jurisdiction, 'Jurisdiction'),
  }),
};
