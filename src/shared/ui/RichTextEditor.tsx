import { useEffect, useRef } from 'react';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import { useTranslation } from 'react-i18next';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

/**
 * Lightweight rich-text editor matching the product-form Description toolbar
 * (TRD §5.3). Built on `contentEditable` + `document.execCommand` so it needs no
 * extra library (TRD §1 forbids new UI deps). Stores HTML; an empty document is
 * normalized to `''`.
 */
export function RichTextEditor({ value, onChange, placeholder, ariaLabel }: RichTextEditorProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  // Push the external value into the DOM only when it diverges (e.g. a form
  // reset) — during typing the two already match, so the caret is never reset.
  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  const emit = () => {
    const html = ref.current?.innerHTML ?? '';
    onChange(html === '<br>' ? '' : html);
  };

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const addLink = () => {
    const url = window.prompt(t('products.form.linkPrompt') ?? '');
    if (url) exec('createLink', url);
  };

  const isEmpty = value === '' || value === '<br>';

  const buttonClass =
    'flex h-8 w-8 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100';

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 focus-within:border-blue-500 dark:border-slate-600">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800/60">
        <span className="px-2 text-sm text-slate-500 dark:text-slate-400">
          {t('products.form.normal')}
        </span>
        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
        <button
          type="button"
          className={buttonClass}
          onClick={() => exec('bold')}
          aria-label={t('products.form.bold')}
        >
          <FormatBoldIcon fontSize="small" />
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => exec('italic')}
          aria-label={t('products.form.italic')}
        >
          <FormatItalicIcon fontSize="small" />
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => exec('underline')}
          aria-label={t('products.form.underline')}
        >
          <FormatUnderlinedIcon fontSize="small" />
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={addLink}
          aria-label={t('products.form.link')}
        >
          <InsertLinkIcon fontSize="small" />
        </button>
        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
        <button
          type="button"
          className={buttonClass}
          onClick={() => exec('insertOrderedList')}
          aria-label={t('products.form.orderedList')}
        >
          <FormatListNumberedIcon fontSize="small" />
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => exec('insertUnorderedList')}
          aria-label={t('products.form.bulletList')}
        >
          <FormatListBulletedIcon fontSize="small" />
        </button>
        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
        <button
          type="button"
          className={buttonClass}
          onClick={() => exec('removeFormat')}
          aria-label={t('products.form.clearFormatting')}
        >
          <FormatClearIcon fontSize="small" />
        </button>
      </div>

      <div className="relative">
        {isEmpty && placeholder && (
          <span className="pointer-events-none absolute top-3 left-4 text-sm text-slate-400 dark:text-slate-500">
            {placeholder}
          </span>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          onInput={emit}
          onBlur={emit}
          className="min-h-[150px] px-4 py-3 text-sm leading-relaxed text-slate-900 outline-none dark:text-white [&_a]:text-blue-600 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
        />
      </div>
    </div>
  );
}
