import { useRef, useState, type DragEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { parseLmsCsv } from '@/games/lms/csv';
import { saveLmsQuiz } from '@/lib/lmsStorage';
import type { LmsQuiz } from '@/games/lms/types';
import { cn } from '@/lib/cn';

interface CsvImporterProps {
  onImported: (quiz: LmsQuiz) => void;
}

function defaultName(filename: string | undefined): string {
  if (!filename) return 'Untitled quiz';
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Untitled quiz';
}

export function CsvImporter({ onImported }: CsvImporterProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<string[] | null>(null);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  const [pendingCsv, setPendingCsv] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const toast = useToast();

  const handleFile = async (file: File) => {
    setErrors(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrors([`"${file.name}" is not a CSV file.`]);
      return;
    }
    try {
      const text = await file.text();
      setPendingCsv(text);
      setLoadedFileName(file.name);
      if (!name) setName(defaultName(file.name));
      const result = parseLmsCsv(text, { name: name || defaultName(file.name) });
      if (!result.ok) {
        setErrors(result.errors);
      } else {
        setErrors(null);
      }
    } catch (err) {
      setErrors([`Failed to read file: ${(err as Error).message}`]);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const handleSave = () => {
    if (!pendingCsv) return;
    const finalName = name.trim() || defaultName(loadedFileName ?? undefined);
    const result = parseLmsCsv(pendingCsv, { name: finalName });
    if (!result.ok) {
      setErrors(result.errors);
      toast.show({
        title: 'Quiz could not be saved',
        description: 'Fix the highlighted issues and try again.',
        tone: 'error',
      });
      return;
    }
    saveLmsQuiz(result.quiz);
    toast.show({ title: `Saved "${result.quiz.name}"`, tone: 'success' });
    setPendingCsv(null);
    setLoadedFileName(null);
    setName('');
    setErrors(null);
    if (fileRef.current) fileRef.current.value = '';
    onImported(result.quiz);
  };

  const handleClear = () => {
    setPendingCsv(null);
    setLoadedFileName(null);
    setErrors(null);
    setName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const ready = !!pendingCsv && (errors === null || errors.length === 0);

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'rounded-lg border border-dashed p-6 transition-colors',
          isDragOver
            ? 'border-[color:var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]'
            : 'border-border hover:border-border-strong bg-surface',
        )}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-2 text-fg-muted font-mono text-xs">
            CSV
          </div>
          <div>
            <p className="text-sm font-medium text-fg">
              Drop a CSV here or pick a file
            </p>
            <p className="text-xs text-fg-muted mt-1">
              Columns: <span className="font-mono">round,category,answer</span> · 1+ rounds, 2+ answers each
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              Choose file
            </Button>
            <a
              href="/lms-sample.csv"
              download="lms-sample.csv"
              className="text-xs text-fg-muted hover:text-fg transition-colors"
            >
              Download sample
            </a>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </div>
      </div>

      {loadedFileName && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-fg-muted font-mono truncate">{loadedFileName}</div>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-fg-muted hover:text-fg transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-fg-muted">Quiz name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pub Night – Wissens-Marathon"
            />
          </div>
          {errors && errors.length > 0 && (
            <div className="rounded-md border border-[color-mix(in_srgb,var(--danger)_30%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-3">
              <p className="text-xs font-semibold text-danger mb-1">
                {errors.length} issue{errors.length === 1 ? '' : 's'} to fix
              </p>
              <ul className="text-xs text-fg-muted list-disc pl-4 space-y-1 max-h-40 overflow-y-auto">
                {errors.map((err, i) => (
                  <li key={i} className="leading-relaxed">{err}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!ready}>
              Save quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
