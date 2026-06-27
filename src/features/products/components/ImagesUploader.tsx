import { useEffect, useRef, useState } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ACCEPT = 'image/svg+xml,image/png,image/jpeg,image/gif';

interface ImagesUploaderProps {
  value: File[];
  onChange: (files: File[]) => void;
}

/**
 * Product images block (TRD §5.3, mockup `Detail products.png`): a dashed
 * click/drag dropzone above a table of uploaded files (thumbnail · name ·
 * delete). Files are appended to the multipart `Images` parts on save (TRD §7).
 */
export function ImagesUploader({ value, onChange }: ImagesUploaderProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // Rebuild object URLs whenever the file list changes; revoke them on cleanup.
  useEffect(() => {
    const urls = value.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [value]);

  const addFiles = (files: FileList | null | undefined) => {
    if (!files || files.length === 0) return;
    onChange([...value, ...Array.from(files)]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(e) => addFiles(e.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-7 text-center transition-colors hover:border-blue-400 dark:border-slate-600 dark:hover:border-blue-500"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
          <FileUploadOutlinedIcon fontSize="small" />
        </span>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium text-slate-900 underline dark:text-white">
            {t('catalog.clickToUpload')}
          </span>{' '}
          {t('catalog.orDragAndDrop')}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {t('catalog.uploadFormats')}
        </span>
      </button>

      {value.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 dark:text-slate-500">
              <th className="rounded-l-lg bg-slate-50 py-2 pl-3 font-medium dark:bg-slate-800/60">
                {t('products.form.image')}
              </th>
              <th className="bg-slate-50 py-2 font-medium dark:bg-slate-800/60">
                {t('products.form.fileName')}
              </th>
              <th className="rounded-r-lg bg-slate-50 py-2 pr-3 text-right font-medium dark:bg-slate-800/60">
                {t('common.action')}
              </th>
            </tr>
          </thead>
          <tbody>
            {value.map((file, index) => (
              <tr key={`${file.name}-${index}`} className="align-middle">
                <td className="py-2 pl-3">
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                </td>
                <td className="py-2 pr-2">
                  <span className="block max-w-[180px] truncate text-slate-700 dark:text-slate-200">
                    {file.name}
                  </span>
                </td>
                <td className="py-2 pr-3 text-right">
                  <IconButton
                    size="small"
                    onClick={() => removeFile(index)}
                    aria-label={t('common.delete')}
                  >
                    <DeleteOutlineIcon fontSize="small" className="text-red-500" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
