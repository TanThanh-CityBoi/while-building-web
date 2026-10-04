import { CHAT_LIMITS } from '@while-building/types';
import { Alert, AlertDescription, AlertTitle } from '@while-building/ui/components/alert';
import { Button } from '@while-building/ui/components/button';
import { Card } from '@while-building/ui/components/card';
import { NativeSelect, NativeSelectOption } from '@while-building/ui/components/native-select';
import { Spinner } from '@while-building/ui/components/spinner';
import { Textarea } from '@while-building/ui/components/textarea';
import { cn } from '@while-building/ui/lib/utils';
import { SparklesIcon } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Page, PageHeader } from '@/components/Page';
import { EmptyState } from '@/components/States';
import { ToneBadge } from '@/components/ToneBadge';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { api } from '@/lib/api';
import { activityLabel } from './activity';
import { useModelSelection } from './modelSelection';
import { useModelOptions } from './queries';
import { useChat, type Activity, type ChatClient, type ChatTurn } from './useChat';

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

  const placeholder = modelOptions.isPending ? 'Loading…' : 'Default';

  return (
    <Page>
      <PageHeader
        eyebrow="Assistant"
        title="Ask While Building"
        description="Questions about published articles and projects. Answers come from the site's content; the assistant can't change anything."
        actions={
          chat.turns.length > 0 && (
            <Button variant="outline" size="sm" onClick={chat.reset} disabled={chat.streaming}>
              New conversation
            </Button>
          )
        }
      />

      {!chat.isConfigured && (
        <Alert className="mb-4">
          <AlertTitle>The assistant is not configured</AlertTitle>
          <AlertDescription>
            <p>
              Set <code className="font-mono">VITE_AI_URL</code> to the AI app&apos;s URL and
              restart the CMS.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Card className="grid min-h-[min(70vh,48rem)] grid-rows-[auto_minmax(16rem,1fr)_auto] gap-0 py-0">
        {chat.isConfigured ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <label htmlFor="assistant-provider">Provider</label>
              <NativeSelect
                id="assistant-provider"
                size="sm"
                value={models.selection?.provider ?? ''}
                disabled={!models.selection || chat.streaming}
                onChange={(event) => models.selectProvider(event.target.value)}
              >
                {models.providers.length > 0 ? (
                  models.providers.map((p) => (
                    <NativeSelectOption key={p.id} value={p.id}>
                      {p.label}
                    </NativeSelectOption>
                  ))
                ) : (
                  <NativeSelectOption value="">{placeholder}</NativeSelectOption>
                )}
              </NativeSelect>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <label htmlFor="assistant-model">Model</label>
              <NativeSelect
                id="assistant-model"
                size="sm"
                value={models.selection?.model ?? ''}
                disabled={!models.selection || chat.streaming}
                onChange={(event) => models.selectModel(event.target.value)}
              >
                {models.models.length > 0 ? (
                  models.models.map((m) => (
                    <NativeSelectOption key={m.id} value={m.id}>
                      {m.label}
                    </NativeSelectOption>
                  ))
                ) : (
                  <NativeSelectOption value="">{placeholder}</NativeSelectOption>
                )}
              </NativeSelect>
            </div>
            {modelOptions.isError && (
              <span className="text-xs text-muted-foreground" role="status">
                Couldn&apos;t load the models: questions use the server&apos;s default.
              </span>
            )}
          </div>
        ) : (
          <div />
        )}
        {chat.turns.length === 0 ? (
          <EmptyState
            icon={<SparklesIcon />}
            title="Ask about your content"
            description="The assistant searches published articles and projects and cites what it used."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
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
            className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto p-4 sm:p-5"
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

        <form className="flex flex-col gap-2 border-t p-4" onSubmit={onSubmit}>
          <Textarea
            aria-label="Your question"
            placeholder="Ask about articles and projects…"
            rows={2}
            value={draft}
            maxLength={CHAT_LIMITS.maxContentLength}
            disabled={!chat.isConfigured}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            className="min-h-16 resize-y"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              Enter to send · Shift+Enter for a new line
            </span>
            {chat.streaming ? (
              <Button variant="outline" onClick={chat.stop}>
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
    </Page>
  );
}

interface TurnProps {
  turn: ChatTurn;
  activity: Activity;
  onRetry?: () => void;
}

const textClass = 'leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]';

function Turn({ turn, activity, onRetry }: TurnProps) {
  if (turn.role === 'user') {
    return (
      <article
        className="max-w-prose self-end rounded-xl bg-muted px-4 py-3"
        aria-label="Your question"
      >
        <p className={textClass}>{turn.content}</p>
      </article>
    );
  }

  const working = turn.status === 'streaming' && (turn.content === '' || activity?.kind === 'tool');
  return (
    <article className="grid max-w-prose gap-2" aria-label="Assistant answer">
      <span className="font-mono text-xs text-muted-foreground">
        Assistant{turn.model && ` · ${turn.model}`}
      </span>
      {turn.content && <p className={textClass}>{turn.content}</p>}

      {working && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <Spinner role="presentation" aria-hidden="true" aria-label={undefined} />{' '}
          {activityLabel(activity)}
        </p>
      )}

      {turn.status === 'error' && (
        <Alert variant="destructive">
          <AlertTitle>No answer</AlertTitle>
          <AlertDescription>
            <div className="flex flex-wrap items-center gap-3">
              <span>{turn.error}</span>
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Try again
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {turn.status === 'stopped' && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Stopped.</span>
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      )}

      {turn.sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground uppercase">Sources</span>
          <ul className="flex flex-wrap gap-1.5" aria-label="Sources">
            {turn.sources.map((source) => (
              <li key={source.uri}>
                <ToneBadge
                  tone={source.kind === 'article' ? 'brand' : 'neutral'}
                  className={cn('font-mono')}
                >
                  {source.kind === 'article' ? 'Article' : 'Project'} · {source.title}
                </ToneBadge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
