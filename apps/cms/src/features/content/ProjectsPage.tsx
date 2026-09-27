import type { ContentStatus } from '@while-building/types';
import {
  Badge,
  Button,
  Card,
  Dropdown,
  EmptyState,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
  Tag,
} from '@while-building/ui';
import { formatDate, formatRelativeTime, pluralize } from '@while-building/utils';
import { useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import {
  IconArchive,
  IconMore,
  IconPencil,
  IconPlus,
  IconProject,
  IconStar,
  IconTrash,
  IconUpload,
} from '@/components/icons';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ContentFilters, ContentStatusBadge, NotBuiltYetDialog } from './components';
import { useContentProjects } from './queries';
import styles from './ContentPage.module.css';

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

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Content"
        title="Projects"
        description="Side projects, experiments and prototypes shown on the public site."
        actions={
          <Button
            onClick={() => setPendingAction('New project')}
            disabled={!can('CONTENT_CREATE')}
            title={can('CONTENT_CREATE') ? undefined : 'Requires the CONTENT_CREATE permission'}
          >
            <IconPlus /> New project
          </Button>
        }
      />

      <Card padding="none">
        <ContentFilters
          noun="projects"
          search={search}
          status={status}
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
            icon={<IconProject />}
            title={hasFilters ? 'No projects match your filters' : 'No projects yet'}
            action={
              hasFilters && (
                <Button
                  variant="secondary"
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Project</TableHeaderCell>
                  <TableHeaderCell>Technologies</TableHeaderCell>
                  <TableHeaderCell>Stage</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Updated</TableHeaderCell>
                  <TableHeaderCell align="end">
                    <span className="visually-hidden">Actions</span>
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.data.map((project) => {
                  const extra = project.technologies.length - MAX_TECHNOLOGIES;
                  return (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className={styles.primary}>
                          <span className={styles.title}>
                            {project.name}
                            {project.featured && (
                              <span className={styles.featured} title="Featured on the home page">
                                <IconStar width={14} height={14} />
                                <span className="visually-hidden">(featured)</span>
                              </span>
                            )}
                          </span>
                          <span className={styles.slug}>/{project.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={styles.tags}>
                          {project.technologies.slice(0, MAX_TECHNOLOGIES).map((tech) => (
                            <Tag key={tech}>{tech}</Tag>
                          ))}
                          {extra > 0 && <span className={styles.more}>+{extra}</span>}
                        </div>
                      </TableCell>
                      <TableCell muted>{project.stage ?? '—'}</TableCell>
                      <TableCell>
                        <ContentStatusBadge status={project.status} />
                      </TableCell>
                      <TableCell muted>
                        <time dateTime={project.updatedAt} title={formatDate(project.updatedAt)}>
                          {formatRelativeTime(project.updatedAt)}
                        </time>
                      </TableCell>
                      <TableCell align="end">
                        <div className={styles.actions}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPendingAction(`Edit “${project.name}”`)}
                            disabled={!can('CONTENT_UPDATE')}
                            aria-label={`Edit ${project.name}`}
                          >
                            <IconPencil /> Edit
                          </Button>
                          <Dropdown
                            label={`More actions for ${project.name}`}
                            trigger={<IconMore />}
                            items={[
                              project.status === 'PUBLISHED'
                                ? {
                                    id: 'unpublish',
                                    label: 'Unpublish',
                                    icon: <IconArchive />,
                                    disabled: !can('CONTENT_PUBLISH'),
                                    disabledReason: 'Requires the CONTENT_PUBLISH permission',
                                    onSelect: () => setPendingAction(`Unpublish “${project.name}”`),
                                  }
                                : {
                                    id: 'publish',
                                    label: 'Publish',
                                    icon: <IconUpload />,
                                    disabled: !can('CONTENT_PUBLISH'),
                                    disabledReason: 'Requires the CONTENT_PUBLISH permission',
                                    onSelect: () => setPendingAction(`Publish “${project.name}”`),
                                  },
                              { id: 'separator', separator: true },
                              {
                                id: 'delete',
                                label: 'Delete',
                                icon: <IconTrash />,
                                tone: 'danger',
                                disabled: !can('CONTENT_DELETE'),
                                disabledReason: 'Requires the CONTENT_DELETE permission',
                                onSelect: () => setPendingAction(`Delete “${project.name}”`),
                              },
                            ]}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <p className={styles.note}>
        <Badge tone="info">Sample data</Badge> Projects come from local sample data until the
        content API exists.
      </p>

      <NotBuiltYetDialog action={pendingAction} onClose={() => setPendingAction(null)} />
    </PageContainer>
  );
}
