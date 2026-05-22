import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { quizToCsv } from '@/games/jeopardy/csv';
import {
  deleteQuiz as storageDelete,
  duplicateQuiz as storageDuplicate,
  renameQuiz as storageRename,
} from '@/lib/storage';
import { cn } from '@/lib/cn';
import type { Quiz } from '@/games/jeopardy/types';

interface QuizListProps {
  quizzes: Quiz[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChanged: () => void;
}

function downloadCsv(quiz: Quiz) {
  const csv = quizToCsv(quiz);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${quiz.name.replace(/[^a-z0-9-_]+/gi, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

export function QuizList({ quizzes, selectedId, onSelect, onChanged }: QuizListProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const toast = useToast();

  if (quizzes.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-5 py-8 text-center">
        <p className="text-sm text-fg">No quizzes yet</p>
        <p className="mt-1 text-xs text-fg-muted">
          Import a CSV above or download the sample to start.
        </p>
      </div>
    );
  }

  const startRename = (quiz: Quiz) => {
    setRenamingId(quiz.id);
    setDraftName(quiz.name);
  };

  const commitRename = () => {
    if (!renamingId) return;
    storageRename(renamingId, draftName);
    setRenamingId(null);
    setDraftName('');
    onChanged();
  };

  const handleDelete = (quiz: Quiz) => {
    if (!window.confirm(`Delete "${quiz.name}"? This can't be undone.`)) return;
    storageDelete(quiz.id);
    toast.show({ title: `Deleted "${quiz.name}"` });
    onChanged();
  };

  const handleDuplicate = (quiz: Quiz) => {
    const copy = storageDuplicate(quiz.id);
    if (copy) {
      toast.show({ title: `Duplicated as "${copy.name}"` });
      onChanged();
    }
  };

  return (
    <ul className="flex flex-col rounded-lg border border-border bg-surface overflow-hidden">
      {quizzes.map((quiz, i) => {
        const isSelected = selectedId === quiz.id;
        const isRenaming = renamingId === quiz.id;
        return (
          <li
            key={quiz.id}
            className={cn(
              'group flex items-center gap-3 px-4 py-3 transition-colors',
              i > 0 && 'border-t border-border',
              isSelected ? 'bg-surface-2' : 'hover:bg-surface-2',
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(quiz.id)}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-xs font-mono transition-colors ring-focus',
                isSelected
                  ? 'border-[color:var(--accent)] bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-fg'
                  : 'border-border text-fg-muted group-hover:border-border-strong',
              )}
              aria-label={isSelected ? 'Selected' : 'Select quiz'}
            >
              {isSelected ? '✓' : ''}
            </button>
            <div className="flex flex-1 min-w-0 flex-col">
              {isRenaming ? (
                <Input
                  value={draftName}
                  autoFocus
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') {
                      setRenamingId(null);
                      setDraftName('');
                    }
                  }}
                  className="h-8 text-sm"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onSelect(quiz.id)}
                  className="text-left text-sm font-medium text-fg truncate"
                >
                  {quiz.name}
                </button>
              )}
              <span className="text-xs text-fg-muted font-mono">
                {quiz.categories.length} cats · {quiz.cells.length} cells · {formatRelative(quiz.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" onClick={() => startRename(quiz)}>
                Rename
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDuplicate(quiz)}>
                Duplicate
              </Button>
              <Button variant="ghost" size="sm" onClick={() => downloadCsv(quiz)}>
                Export
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(quiz)}>
                Delete
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
