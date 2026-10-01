/** One server-sent event: its `event:` name (default `message`) and its joined `data:` lines. */
export interface SseMessage {
  event: string;
  data: string;
}

const LINE_END = /\r\n|\r|\n/;

/**
 * Parses a `text/event-stream` body into events, as they arrive. Handles
 * CRLF/CR/LF line endings, multi-line `data:`, comments (`: ping`) and lines
 * split across chunks. An unfinished event at the end of the stream is dropped.
 */
export async function* parseSse(stream: ReadableStream<Uint8Array>): AsyncGenerator<SseMessage> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let event = '';
  let data: string[] = [];
  let finished = false;

  /** Consumes every complete line in the buffer, yielding finished events. */
  function* drain(endOfStream: boolean): Generator<SseMessage> {
    for (;;) {
      const match = LINE_END.exec(buffer);
      if (!match) return;
      // A lone CR at the very end may be the first half of a CRLF: wait for more.
      if (!endOfStream && match[0] === '\r' && match.index === buffer.length - 1) return;
      const line = buffer.slice(0, match.index);
      buffer = buffer.slice(match.index + match[0].length);

      if (line === '') {
        if (data.length > 0) yield { event: event || 'message', data: data.join('\n') };
        event = '';
        data = [];
      } else if (!line.startsWith(':')) {
        const colon = line.indexOf(':');
        const field = colon === -1 ? line : line.slice(0, colon);
        const raw = colon === -1 ? '' : line.slice(colon + 1);
        const value = raw.startsWith(' ') ? raw.slice(1) : raw;
        if (field === 'event') event = value;
        else if (field === 'data') data.push(value);
      }
    }
  }

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) {
        finished = true;
        buffer += decoder.decode();
        yield* drain(true);
        return;
      }
      // `stream: true` keeps multi-byte characters split across chunks intact.
      buffer += decoder.decode(value, { stream: true });
      yield* drain(false);
    }
  } finally {
    // The consumer stopped early: stop downloading.
    if (!finished) await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
