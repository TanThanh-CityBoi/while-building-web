import type { ContentStatus } from '@while-building/types';
import { Button } from '@while-building/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@while-building/ui/components/dialog';
import { Input } from '@while-building/ui/components/input';
import { NativeSelect, NativeSelectOption } from '@while-building/ui/components/native-select';
import { SearchIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Toolbar } from '@/components/Toolbar';
import { ToneBadge } from '@/components/ToneBadge';
import { contentStatusLabel, contentStatusTone, type StatusOption } from './status';

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  return <ToneBadge tone={contentStatusTone[status]}>{contentStatusLabel[status]}</ToneBadge>;
}

interface ContentFiltersProps<S extends string> {
  noun: string;
  search: string;
  status: S | '';
  statusOptions: StatusOption<S>[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: S | '') => void;
  summary?: string;
  /** More controls after the status filter (e.g. sorting). */
  extra?: ReactNode;
}

/** Search + status filter above a content table. */
export function ContentFilters<S extends string>({
  noun,
  search,
  status,
  statusOptions,
  onSearchChange,
  onStatusChange,
  summary,
  extra,
}: ContentFiltersProps<S>) {
  return (
    <Toolbar summary={summary}>
      <div className="relative">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder={`Search ${noun}…`}
          aria-label={`Search ${noun}`}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <NativeSelect
        aria-label="Filter by status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as S | '')}
      >
        {statusOptions.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {extra}
    </Toolbar>
  );
}

interface NotBuiltYetDialogProps {
  /** e.g. "Edit “Personal Homelab”" — `null` keeps the dialog closed. */
  action: string | null;
  onClose: () => void;
}

/** Placeholder for project actions: projects aren't managed through the API yet. */
export function NotBuiltYetDialog({ action, onClose }: NotBuiltYetDialogProps) {
  return (
    <Dialog open={action !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{action}</DialogTitle>
          <DialogDescription>
            Project management isn’t built yet. This action will be available once
            while-building-api exposes project endpoints.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
