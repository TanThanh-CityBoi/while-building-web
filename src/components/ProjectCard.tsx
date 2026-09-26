import type { Project, ProjectStatus } from '@/types/content';
import { ExternalLink } from './ExternalLink';
import { StatusIndicator, type StatusTone } from './StatusIndicator';
import { TagList } from './Tag';
import styles from './ProjectCard.module.css';

type HeadingLevel = 'h2' | 'h3';

const statusTone: Record<ProjectStatus, StatusTone> = {
  active: 'success',
  experimental: 'warning',
  archived: 'neutral',
};

interface ProjectCardProps {
  project: Project;
  /** Use `h2` when the grid sits directly under the page's `h1`. */
  headingLevel?: HeadingLevel;
}

export function ProjectCard({ project, headingLevel: Heading = 'h3' }: ProjectCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <Heading className={styles.name}>{project.name}</Heading>
        {project.status && (
          <StatusIndicator tone={statusTone[project.status]}>{project.status}</StatusIndicator>
        )}
      </div>
      <p className={styles.description}>{project.description}</p>
      <TagList items={project.technologies} label="Technologies" />
      {project.links && project.links.length > 0 && (
        <ul role="list" className={styles.links}>
          {project.links.map((link) => (
            <li key={link.label}>
              <ExternalLink {...link} />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

interface ProjectGridProps {
  projects: Project[];
  headingLevel?: HeadingLevel;
}

export function ProjectGrid({ projects, headingLevel }: ProjectGridProps) {
  return (
    <ul role="list" className={styles.grid}>
      {projects.map((project) => (
        <li key={project.slug}>
          <ProjectCard project={project} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
