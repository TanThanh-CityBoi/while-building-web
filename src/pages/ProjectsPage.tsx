import { Container } from '@/components/Container';
import { PageHeader } from '@/components/PageHeader';
import { ProjectGrid } from '@/components/ProjectCard';
import { projects } from '@/data/projects';
import { usePageMeta } from '@/hooks/usePageMeta';

const description =
  'Side projects, experiments and prototypes — some finished, most still being built.';

export function ProjectsPage() {
  usePageMeta({ title: 'Projects', description });

  return (
    <Container>
      <PageHeader eyebrow="~/projects" title="Projects" description={description} />
      <ProjectGrid projects={projects} headingLevel="h2" />
    </Container>
  );
}
