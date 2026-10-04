import { buttonVariants } from '@while-building/ui/components/button';
import { ArrowLeftIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { articlesPath } from '../paths';

interface WorkspaceBarProps {
  /** Status and save state, next to the back link. */
  status?: ReactNode;
  /** Buttons on the right. */
  actions?: ReactNode;
}

/** The editor's top bar: back to the list, status, actions. Sticks under the app header. */
export function WorkspaceBar({ status, actions }: WorkspaceBarProps) {
  return (
    <div className="sticky top-14 z-10 -mx-4 -mt-6 mb-6 flex flex-wrap items-center gap-2 border-b bg-background/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
      <Link to={articlesPath} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
        <ArrowLeftIcon data-icon="inline-start" /> Articles
      </Link>
      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">{status}</div>
      {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
