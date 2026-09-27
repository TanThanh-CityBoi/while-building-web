import { ErrorState, LoadingState, PageContainer, PageHeader } from '@while-building/ui';
import { ProjectGrid } from '@/components/ProjectCard';
import { useProjects } from '@/content/queries';
import { usePageMeta } from '@/hooks/usePageMeta';

const description =
  'Side projects, experiments and prototypes — some finished, most still being built.';

export function ProjectsPage() {
  usePageMeta({ title: 'Projects', description });
  const projects = useProjects();

  return (
    <PageContainer>
      <PageHeader eyebrow="~/projects" title="Projects" description={description} />
      {projects.isPending ? (
        <LoadingState label="Loading projects…" />
      ) : projects.isError ? (
        <ErrorState title="Couldn't load projects" onRetry={() => void projects.refetch()} />
      ) : (
        <ProjectGrid projects={projects.data} headingLevel="h2" />
      )}
    </PageContainer>
  );
}
