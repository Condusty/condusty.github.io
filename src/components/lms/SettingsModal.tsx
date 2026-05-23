import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLmsStore } from '@/games/lms/store';
import type { SurvivorPointsType } from '@/games/lms/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const settings = useLmsStore((s) => s.settings);
  const updateSettings = useLmsStore((s) => s.updateSettings);

  const [pointsType, setPointsType] = useState<SurvivorPointsType>(settings.survivorPointsType);
  const [fixedValue, setFixedValue] = useState(settings.fixedPointsValue.toString());
  const [timerEnabled, setTimerEnabled] = useState(settings.answerCardTimerEnabled);
  const [timerDuration, setTimerDuration] = useState(settings.answerCardTimerDuration?.toString() ?? '120');

  useEffect(() => {
    if (isOpen) {
      setPointsType(settings.survivorPointsType);
      setFixedValue(settings.fixedPointsValue.toString());
      setTimerEnabled(settings.answerCardTimerEnabled);
      setTimerDuration(settings.answerCardTimerDuration?.toString() ?? '120');
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    updateSettings({
      survivorPointsType: pointsType,
      fixedPointsValue: parseInt(fixedValue, 10) || 0,
      answerCardTimerEnabled: timerEnabled,
      answerCardTimerDuration: parseInt(timerDuration, 10) || 120,
    });
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-fg-muted" />
          <ModalTitle>LMS Settings</ModalTitle>
        </div>
      </ModalHeader>
      <ModalBody className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-fg">
            Survivor Points Distribution
            <span className="block text-xs font-normal text-fg-muted mt-1">
              How many points players who are NOT eliminated get at the end of the round.
            </span>
          </label>
          <select
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg transition-colors hover:border-border-strong focus:border-[color-mix(in_srgb,var(--accent)_60%,var(--border-strong))] ring-focus outline-none"
            value={pointsType}
            onChange={(e) => setPointsType(e.target.value as SurvivorPointsType)}
          >
            <option value="standard">Standard (Total players in round)</option>
            <option value="half">Half (Standard / 2)</option>
            <option value="double">Double (Standard * 2)</option>
            <option value="fixed">Fixed Value</option>
          </select>
        </div>

        {pointsType === 'fixed' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-fg">
              Fixed Points Value
              <span className="block text-xs font-normal text-fg-muted mt-1">
                Points given to survivors when using "Fixed" distribution.
              </span>
            </label>
            <Input
              type="number"
              min="1"
              value={fixedValue}
              onChange={(e) => setFixedValue(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-fg cursor-pointer" htmlFor="timer-toggle">
              Host Answer Timer
            </label>
            <span className="text-xs text-fg-muted">
              Enable a visual timer for the host when revealing answers.
            </span>
          </div>
          <input
            id="timer-toggle"
            type="checkbox"
            className="w-4 h-4 rounded border-border bg-surface text-accent ring-focus"
            checked={timerEnabled}
            onChange={(e) => setTimerEnabled(e.target.checked)}
          />
        </div>

        {timerEnabled && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-fg">
              Timer Duration (seconds)
            </label>
            <Input
              type="number"
              min="1"
              value={timerDuration}
              onChange={(e) => setTimerDuration(e.target.value)}
            />
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Settings
        </Button>
      </ModalFooter>
    </Modal>
  );
}
