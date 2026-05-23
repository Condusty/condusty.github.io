import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useJeopardyStore } from '@/games/jeopardy/store';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const settings = useJeopardyStore((s) => s.settings);
  const updateSettings = useJeopardyStore((s) => s.updateSettings);

  const [penalty, setPenalty] = useState(settings.wrongAnswerPenalty.toString());
  const [timeLimit, setTimeLimit] = useState(settings.answerTimeLimit.toString());

  useEffect(() => {
    if (isOpen) {
      setPenalty(settings.wrongAnswerPenalty.toString());
      setTimeLimit(settings.answerTimeLimit.toString());
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    updateSettings({
      wrongAnswerPenalty: parseFloat(penalty) || 0,
      answerTimeLimit: parseInt(timeLimit, 10) || 0,
    });
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-fg-muted" />
          <ModalTitle>Game Settings</ModalTitle>
        </div>
      </ModalHeader>
      <ModalBody className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-fg">
            Wrong Answer Penalty
            <span className="block text-xs font-normal text-fg-muted mt-1">
              Percentage of the question value deducted on a wrong answer (0.0 to 1.0).
            </span>
          </label>
          <Input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={penalty}
            onChange={(e) => setPenalty(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-fg">
            Answer Time Limit (seconds)
            <span className="block text-xs font-normal text-fg-muted mt-1">
              Seconds allowed to answer. Use 0 for no limit.
            </span>
          </label>
          <Input
            type="number"
            min="0"
            step="5"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
          />
        </div>
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
