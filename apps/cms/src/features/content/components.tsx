import type { ContentStatus } from '@while-building/types';
import { Badge, Button, Dialog, DialogBody, DialogFooter, Input, Select } from '@while-building/ui';
import { Toolbar } from '@/components/Toolbar';
import { contentStatusLabel, contentStatusOptions, contentStatusTone } from './status';

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  return <Badge tone={contentStatusTone[status]}>{contentStatusLabel[status]}</Badge>;
}

interface ContentFiltersProps {
  noun: string;
  search: string;
  status: ContentStatus | '';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ContentStatus | '') => void;
  summary?: string;
}

export function ContentFilters({
  noun,
  search,
  status,
  onSearchChange,
  onStatusChange,
  summary,
}: ContentFiltersProps) {
  return (
    <Toolbar summary={summary}>
      <Input
        type="search"
        controlSize="sm"
        placeholder={`Search ${noun}…`}
        aria-label={`Search ${noun}`}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select
        controlSize="sm"
        aria-label="Filter by status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as ContentStatus | '')}
        options={contentStatusOptions}
      />
    </Toolbar>
  );
}

interface NotBuiltYetDialogProps {
  /** e.g. "Edit “Running PostgreSQL…”" — `null` keeps the dialog closed. */
  action: string | null;
  onClose: () => void;
}

/** Placeholder for CMS actions whose editor/workflow isn't built yet. */
export function NotBuiltYetDialog({ action, onClose }: NotBuiltYetDialogProps) {
  return (
    <Dialog open={action !== null} onClose={onClose} title={action ?? ''} size="sm">
      <DialogBody>
        <p>
          The content editor and publishing workflow aren’t built yet. This action will be available
          once while-building-api exposes content endpoints.
        </p>
      </DialogBody>
      <DialogFooter>
        <Button onClick={onClose}>Got it</Button>
      </DialogFooter>
    </Dialog>
  );
}
