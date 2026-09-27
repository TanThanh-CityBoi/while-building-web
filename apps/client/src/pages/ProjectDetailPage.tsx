import { Badge, ErrorState, LoadingState, PageContainer, TagList } from '@while-building/ui';
import { useParams } from 'react-router';
import { ButtonLink } from '@/components/ButtonLink';
import { ExternalLink } from '@/components/ExternalLink';
import { useProject } from '@/content/queries';
import { usePageMeta } from '@/hooks/usePageMeta';
import { stageTone } from '@/lib/projectStage';
import { NotFoundPage } from './NotFoundPage';
import styles from './DetailPage.module.css';

export function ProjectDetailPage() {
  const { slug = '' } = useParams();
  const { data: project, isPending, isError, refetch } = useProject(slug);
  usePageMeta({ title: project?.name ?? 'Projects', description: project?.description });

  if (isPending) {
    return (
      <PageContainer>
        <LoadingState label="Loading project…" />
      </PageContainer>
    );
  }
  if (isError) {
    return (
      <PageContainer>
        <ErrorState title="Couldn't load this project" onRetry={() => void refetch()} />
      </PageContainer>
    );
  }
  if (!project) return <NotFoundPage />;

  return (
    <PageContainer>
      <article className={styles.article}>
        <ButtonLink to="/projects" variant="text" className={styles.back}>
          <span aria-hidden="true">←</span> All projects
        </ButtonLink>

        <header className={styles.header}>
          {project.stage && (
            <div className={styles.meta}>
              <Badge variant="dot" tone={stageTone[project.stage]}>
                {project.stage}
              </Badge>
            </div>
          )}
          <h1 className={styles.title}>{project.name}</h1>
          <p className={styles.lede}>{project.description}</p>
        </header>

        <dl className={styles.facts}>
          <div>
            <dt>Technologies</dt>
            <dd>
              <TagList items={project.technologies} label="Technologies" />
            </dd>
          </div>
          {project.links && project.links.length > 0 && (
            <div>
              <dt>Links</dt>
              <dd>
                <ul role="list" className={styles.links}>
                  {project.links.map((link) => (
                    <li key={link.label}>
                      <ExternalLink {...link} />
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>

        <p className={styles.placeholder}>
          A longer write-up — architecture, decisions and what broke along the way — is coming soon.
        </p>
      </article>
    </PageContainer>
  );
}
