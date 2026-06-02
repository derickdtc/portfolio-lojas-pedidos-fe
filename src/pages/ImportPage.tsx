import { FileSpreadsheet, Upload } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';

import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { getApiErrorMessage } from '../services/api';
import { importProducts } from '../services/productService';
import type { ProductImportResponse } from '../types/api';

export function ImportPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<ProductImportResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || isSubmitting) {
      return;
    }

    setFileName(file.name);
    setErrorMessage('');
    setResult(null);
    setIsSubmitting(true);

    try {
      setResult(await importProducts(file));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível importar o estoque.'));
    } finally {
      setIsSubmitting(false);
      event.target.value = '';
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <p className="mb-2 text-xs font-extrabold uppercase text-clay">Estoque</p>
      <h1 className="text-3xl font-black leading-tight text-ink">Importar planilha</h1>

      <div className="mt-5 rounded-lg border border-line bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cream text-forest">
              <FileSpreadsheet size={25} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase text-[#738075]">Arquivo</p>
              <p className="mt-1 truncate text-sm font-extrabold text-ink">
                {fileName || 'Nenhuma planilha selecionada'}
              </p>
            </div>
          </div>

          <input
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={handleFileChange}
            ref={inputRef}
            type="file"
          />
          <Button
            className="w-full sm:w-auto"
            icon={<Upload size={17} />}
            isLoading={isSubmitting}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            Selecionar .xlsx
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          {result ? (
            <div className="rounded-lg border border-[#badcc8] bg-[#e2f2e8] p-4">
              <h2 className="text-sm font-black text-forest">Importação concluída</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-white/65 p-3">
                  <p className="text-lg font-black text-ink">{result.imported}</p>
                  <p className="mt-1 text-xs font-bold text-moss">importados</p>
                </div>
                <div className="rounded-lg bg-white/65 p-3">
                  <p className="text-lg font-black text-ink">{result.replaced}</p>
                  <p className="mt-1 text-xs font-bold text-moss">substituídos</p>
                </div>
                <div className="rounded-lg bg-white/65 p-3">
                  <p className="text-lg font-black text-ink">{result.skipped}</p>
                  <p className="mt-1 text-xs font-bold text-moss">ignorados</p>
                </div>
              </div>
            </div>
          ) : null}

          {result?.warnings?.length ? (
            <div className="space-y-2">
              {result.warnings.map((warning) => (
                <Alert key={warning} tone="warning">
                  {warning}
                </Alert>
              ))}
            </div>
          ) : null}

          {errorMessage ? <Alert tone="danger">{errorMessage}</Alert> : null}
        </div>
      </div>
    </section>
  );
}
