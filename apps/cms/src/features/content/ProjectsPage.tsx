import type { ContentStatus } from '@while-building/types';
import { Badge } from '@while-building/ui/components/badge';
import { Button } from '@while-building/ui/components/button';
import { Card } from '@while-building/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@while-building/ui/components/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@while-building/ui/components/table';
import { formatDate, formatRelativeTime, pluralize } from '@while-building/utils';
import {
  EyeOffIcon,
  FolderKanbanIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  StarIcon,
  Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { Page, PageHeader } from '@/components/Page';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { ToneBadge } from '@/components/ToneBadge';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ContentFilters, ContentStatusBadge, NotBuiltYetDialog } from './components';
import { useContentProjects } from './queries';
import { projectStatusOptions } from './status';

const MAX_TECHNOLOGIES = 3;

export function ProjectsPage() {
  useDocumentTitle('Projects');
  const { can } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ContentStatus | ''>('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim());
  const projects = useContentProjects({
    search: debouncedSearch || undefined,
    status: status || undefined,
  });
  const hasFilters = Boolean(search || status);
  const missing = (permission: string) => `Requires the ${permission} permission`;

  return (
    <Page>
      <PageHeader
        eyebrow="Content"
        title="Projects"
        description="Side projects, experiments and prototypes shown on the public site."
        actions={
          <Button
            onClick={() => setPendingAction('New project')}
            disabled={!can('CONTENT_CREATE')}
            title={can('CONTENT_CREATE') ? undefined : missing('CONTENT_CREATE')}
          >
            <PlusIcon data-icon="inline-start" /> New project
          </Button>
        }
      />

      <Card className="gap-0 py-0">
        <ContentFilters
          noun="projects"
          search={search}
          status={status}
          statusOptions={projectStatusOptions}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          summary={projects.data && pluralize(projects.data.length, 'project')}
        />

        {projects.isPending ? (
          <LoadingState label="Loading projects…" />
        ) : projects.isError ? (
          <ErrorState title="Couldn't load projects" onRetry={() => void projects.refetch()} />
        ) : projects.data.length === 0 ? (
          <EmptyState
            icon={<FolderKanbanIcon />}
            title={hasFilters ? 'No projects match your filters' : 'No projects yet'}
            action={
              hasFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStatus('');
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Project</TableHead>
                <TableHead>Technologies</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="pr-4 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.data.map((project) => {
                const extra = project.technologies.length - MAX_TECHNOLOGIES;
                return (
                  <TableRow key={project.id}>
                    <TableCell className="pl-4">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 font-medium">
                          {project.name}
                          {project.featured && (
                            <span title="Featured on the home page" className="text-brand">
                              <StarIcon className="size-3.5 fill-current" aria-hidden="true" />
                              <span className="sr-only">(featured)</span>
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          /{project.slug}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        {project.technologies.slice(0, MAX_TECHNOLOGIES).map((tech) => (
                          <Badge key={tech} variant="outline" className="font-mono">
                            {tech}
                          </Badge>
                        ))}
                        {extra > 0 && (
                          <span className="text-xs text-muted-foreground">+{extra}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{project.stage ?? '—'}</TableCell>
                    <TableCell>
                      <ContentStatusBadge status={project.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <time dateTime={project.updatedAt} title={formatDate(project.updatedAt)}>
                        {formatRelativeTime(project.updatedAt)}
                      </time>
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPendingAction(`Edit “${project.name}”`)}
                          disabled={!can('CONTENT_UPDATE')}
                          aria-label={`Edit ${project.name}`}
                        >
                          <PencilIcon data-icon="inline-start" /> Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`More actions for ${project.name}`}
                              />
                            }
                          >
                            <MoreHorizontalIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            {project.status === 'PUBLISHED' ? (
                              <DropdownMenuItem
                                disabled={!can('CONTENT_PUBLISH')}
                                title={
                                  can('CONTENT_PUBLISH') ? undefined : missing('CONTENT_PUBLISH')
                                }
                                onClick={() => setPendingAction(`Unpublish “${project.name}”`)}
                              >
                                <EyeOffIcon /> Unpublish
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                disabled={!can('CONTENT_PUBLISH')}
                                title={
                                  can('CONTENT_PUBLISH') ? undefined : missing('CONTENT_PUBLISH')
                                }
                                onClick={() => setPendingAction(`Publish “${project.name}”`)}
                              >
                                <SendIcon /> Publish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={!can('CONTENT_DELETE')}
                              title={can('CONTENT_DELETE') ? undefined : missing('CONTENT_DELETE')}
                              onClick={() => setPendingAction(`Delete “${project.name}”`)}
                            >
                              <Trash2Icon /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <ToneBadge tone="info">Sample data</ToneBadge> Projects come from local sample data until
        the API manages them.
      </p>

      <NotBuiltYetDialog action={pendingAction} onClose={() => setPendingAction(null)} />
    </Page>
  );
}
