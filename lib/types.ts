export type FieldType = 'text' | 'textarea' | 'date' | 'number';

export interface FieldDef<T> {
  name: keyof T & string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
}

export interface ChoiceOption<T> {
  value: string;
  label: string;
  /** Optional numeric input shown inline when this option is selected. */
  numberField?: { name: keyof T & string; suffix: string };
}

export type FormItem<T> =
  | { kind: 'field'; field: FieldDef<T> }
  | { kind: 'choice'; name: keyof T & string; label: string; help?: string; options: ChoiceOption<T>[] };

export interface FormSection<T> {
  id: string;
  title: string;
  items: FormItem<T>[];
}

/**
 * Preview blocks. Text is lightweight inline markdown (**bold**, [link](url))
 * plus `[[value]]` / `[[!placeholder]]` markers for populated / empty values.
 */
export type DocBlock =
  | { type: 'title'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'label'; text: string }
  | { type: 'options'; options: { selected: boolean; text: string }[] }
  | { type: 'signatures'; headers: string[]; rows: { label: string; note?: string; cells: string[] }[] }
  | { type: 'attribution'; text: string };

export type FormErrors<T> = Partial<Record<keyof T & string, string>>;

/** A legal document template: form schema -> typed data -> preview blocks. */
export interface DocumentTemplate<T> {
  id: string;
  title: string;
  attribution: string;
  sections: FormSection<T>[];
  defaults: T;
  validate(data: T): FormErrors<T>;
  renderCoverPage(data: T): DocBlock[];
  /** Standard terms source (verbatim markdown) and the values substituted into it. */
  termsLinks(data: T): Record<string, string>;
}
