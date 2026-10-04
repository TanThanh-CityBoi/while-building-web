import { CHAT_LIMITS } from '@while-building/types';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  PageContainer,
  PageHeader,
  Select,
  Spinner,
  Tag,
  Textarea,
} from '@while-building/ui';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { IconSparkles } from '@/components/icons';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { api } from '@/lib/api';
import { activityLabel } from './activity';
import { useModelSelection } from './modelSelection';
import { useModelOptions } from './queries';
import { useChat, type Activity, type ChatClient, type ChatTurn } from './useChat';
import styles from './AssistantPage.module.css';

const SUGGESTIONS = [
  'Which articles are about Kubernetes?',
  'What projects use NestJS?',
  'Summarise the homelab article',
];

export interface AssistantPageProps {
  /** Defaults to the app's API client; tests pass a fake. */
  client?: ChatClient;
}

export function AssistantPage({ client = api.ai }: AssistantPageProps) {
  useDocumentTitle('Assistant');
  const chat = useChat(client);
  const modelOptions = useModelOptions(client);
  const models = useModelSelection(modelOptions.data);
  const [draft, setDraft] = useState('');
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView?.({ block: 'end' });
  }, [chat.turns]);

  const send = (text: string) => {
    if (!text.trim() || chat.streaming) return;
    chat.send(text, models.selection);
    setDraft('');
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    send(draft);
  };

  // Enter sends; Shift+Enter adds a line.
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send(draft);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Assistant"
        title="Ask While Building"
        description="Questions about published articles and projects. Answers come from the site's content; the assistant can't change anything."
        actions={
          chat.turns.length > 0 && (
            <Button variant="secondary" size="sm" onClick={chat.reset} disabled={chat.streaming}>
              New conversation
            </Button>
          )
        }
      />

      {!chat.isConfigured && (
        <Alert tone="warning" title="The assistant is not configured">
          Set <code>VITE_AI_URL</code> to the AI app&apos;s URL and restart the CMS.
        </Alert>
      )}

      <Card padding="none" className={styles.chat}>
        {chat.isConfigured && (
          <div className={styles.modelBar}>
            <label className={styles.modelField}>
              <span>Provider</span>
              <Select
                controlSize="sm"
                value={models.selection?.provider ?? ''}
                disabled={!models.selection || chat.streaming}
                onChange={(event) => models.selectProvider(event.target.value)}
                options={
                  models.providers.length > 0
                    ? models.providers.map((p) => ({ value: p.id, label: p.label }))
                    : [{ value: '', label: modelOptions.isPending ? 'Loading…' : 'Default' }]
                }
              />
            </label>
            <label className={styles.modelField}>
              <span>Model</span>
              <Select
                controlSize="sm"
                value={models.selection?.model ?? ''}
                disabled={!models.selection || chat.streaming}
                onChange={(event) => models.selectModel(event.target.value)}
                options={
                  models.models.length > 0
                    ? models.models.map((m) => ({ value: m.id, label: m.label }))
                    : [{ value: '', label: modelOptions.isPending ? 'Loading…' : 'Default' }]
                }
              />
            </label>
            {modelOptions.isError && (
              <span className={styles.hint} role="status">
                Couldn&apos;t load the models: questions use the server&apos;s default.
              </span>
            )}
          </div>
        )}
        {chat.turns.length === 0 ? (
          <EmptyState
            icon={<IconSparkles width={24} height={24} />}
            title="Ask about your content"
            description="The assistant searches published articles and projects and cites what it used."
            action={
              <div className={styles.suggestions}>
                {SUGGESTIONS.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="secondary"
                    size="sm"
                    disabled={!chat.isConfigured}
                    onClick={() => send(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            }
          />
        ) : (
          <div
            className={styles.messages}
            role="log"
            aria-label="Conversation"
            aria-busy={chat.streaming}
          >
            {chat.turns.map((turn, index) => (
              <Turn
                key={turn.id}
                turn={turn}
                activity={chat.activity}
                onRetry={
                  index === chat.turns.length - 1 && chat.canRetry
                    ? () => chat.retry(models.selection)
                    : undefined
                }
              />
            ))}
            <div ref={end} />
          </div>
        )}

        <form className={styles.composer} onSubmit={onSubmit}>
          <Textarea
            aria-label="Your question"
            placeholder="Ask about articles and projects…"
            rows={2}
            value={draft}
            maxLength={CHAT_LIMITS.maxContentLength}
            disabled={!chat.isConfigured}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <div className={styles.composerFooter}>
            <span className={styles.hint}>Enter to send · Shift+Enter for a new line</span>
            {chat.streaming ? (
              <Button variant="secondary" onClick={chat.stop}>
                Stop
              </Button>
            ) : (
              <Button type="submit" disabled={!draft.trim() || !chat.isConfigured}>
                Send
              </Button>
            )}
          </div>
        </form>
      </Card>
    </PageContainer>
  );
}

interface TurnProps {
  turn: ChatTurn;
  activity: Activity;
  onRetry?: () => void;
}

function Turn({ turn, activity, onRetry }: TurnProps) {
  if (turn.role === 'user') {
    return (
      <article className={`${styles.turn} ${styles.user}`} aria-label="Your question">
        <p className={styles.text}>{turn.content}</p>
      </article>
    );
  }

  const working = turn.status === 'streaming' && (turn.content === '' || activity?.kind === 'tool');
  return (
    <article className={styles.turn} aria-label="Assistant answer">
      <span className={styles.role}>Assistant{turn.model && ` · ${turn.model}`}</span>
      {turn.content && <p className={styles.text}>{turn.content}</p>}

      {working && (
        <p className={styles.activity} role="status">
          <Spinner size="sm" /> {activityLabel(activity)}
        </p>
      )}

      {turn.status === 'error' && (
        <Alert tone="danger" title="No answer">
          <div className={styles.note}>
            <span>{turn.error}</span>
            {onRetry && (
              <Button variant="secondary" size="sm" onClick={onRetry}>
                Try again
              </Button>
            )}
          </div>
        </Alert>
      )}

      {turn.status === 'stopped' && (
        <div className={styles.note}>
          <span>Stopped.</span>
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      )}

      {turn.sources.length > 0 && (
        <div className={styles.sources}>
          <span className={styles.sourcesLabel}>Sources</span>
          <ul className={styles.sourceList} aria-label="Sources">
            {turn.sources.map((source) => (
              <li key={source.uri}>
                <Tag tone={source.kind === 'article' ? 'accent' : 'neutral'}>
                  {source.kind === 'article' ? 'Article' : 'Project'} · {source.title}
                </Tag>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
