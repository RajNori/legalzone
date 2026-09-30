import type { ChangeEvent } from 'react';
import type { FieldDef, FormErrors, FormItem, FormSection } from '@/lib/types';

interface Props<T extends object> {
  sections: FormSection<T>[];
  data: T;
  errors: FormErrors<T>;
  touched: Set<string>;
  onChange: (name: keyof T & string, value: string) => void;
  onBlur: (name: string) => void;
}

export function DocumentForm<T extends object>({ sections, data, errors, touched, onChange, onBlur }: Props<T>) {
  const get = (name: keyof T & string) => String((data as Record<string, unknown>)[name] ?? '');
  const err = (name: string) => (touched.has(name) ? (errors as Record<string, string | undefined>)[name] : undefined);

  const renderField = (f: FieldDef<T>) => {
    const id = `f-${f.name}`;
    const common = {
      id,
      name: f.name,
      value: get(f.name),
      placeholder: f.placeholder,
      required: f.required,
      'aria-invalid': !!err(f.name),
      'aria-describedby': err(f.name) ? `${id}-err` : undefined,
      onBlur: () => onBlur(f.name),
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(f.name, e.target.value),
    };
    return (
      <div className="field" key={f.name}>
        <label htmlFor={id}>
          {f.label}
          {f.required && <span className="req" aria-hidden="true"> *</span>}
        </label>
        {f.help && <span className="help">{f.help}</span>}
        {f.type === 'textarea' ? <textarea rows={3} {...common} /> : <input type={f.type} {...common} />}
        {err(f.name) && (
          <span className="error" id={`${id}-err`} role="alert">
            {err(f.name)}
          </span>
        )}
      </div>
    );
  };

  const renderItem = (item: FormItem<T>) => {
    if (item.kind === 'field') return renderField(item.field);
    const selected = get(item.name);
    return (
      <fieldset className="field choice" key={item.name}>
        <legend>{item.label}</legend>
        {item.help && <span className="help">{item.help}</span>}
        {item.options.map((o) => {
          const nf = o.numberField;
          const active = selected === o.value;
          return (
            <div className="option" key={o.value}>
              <label>
                <input
                  type="radio"
                  name={item.name}
                  value={o.value}
                  checked={active}
                  onChange={() => onChange(item.name, o.value)}
                />
                {o.label && <span>{o.label}</span>}
              </label>
              {nf && (
                <>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    className="years"
                    aria-label={`${item.label} years`}
                    disabled={!active}
                    value={get(nf.name)}
                    aria-invalid={active && !!err(nf.name)}
                    onBlur={() => onBlur(nf.name)}
                    onChange={(e) => onChange(nf.name, e.target.value)}
                  />
                  <span>{nf.suffix}</span>
                  {active && err(nf.name) && (
                    <span className="error" role="alert">
                      {err(nf.name)}
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </fieldset>
    );
  };

  return (
    <form className="doc-form" onSubmit={(e) => e.preventDefault()} noValidate>
      {sections.map((s) => (
        <section key={s.id} className="form-section">
          <h2>{s.title}</h2>
          {s.items.map(renderItem)}
        </section>
      ))}
    </form>
  );
}
