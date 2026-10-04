import { describe, expect, it } from 'vitest';
import { parseSse, type SseMessage } from './sse';

/** A byte stream delivering the given chunks one by one. */
function streamOf(...chunks: Array<string | Uint8Array>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(typeof chunk === 'string' ? encoder.encode(chunk) : chunk);
      }
      controller.close();
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<SseMessage[]> {
  const messages: SseMessage[] = [];
  for await (const message of parseSse(stream)) messages.push(message);
  return messages;
}

describe('parseSse', () => {
  it('parses named events and skips comments', async () => {
    expect(
      await collect(streamOf(': ping\n\nevent: text\ndata: {"a":1}\n\ndata: plain\n\n')),
    ).toEqual([
      { event: 'text', data: '{"a":1}' },
      { event: 'message', data: 'plain' },
    ]);
  });

  it('joins multi-line data and accepts CRLF, CR and LF line endings', async () => {
    expect(
      await collect(streamOf('event: x\r\ndata: one\r\ndata: two\r\n\r\nevent: y\rdata:three\r\r')),
    ).toEqual([
      { event: 'x', data: 'one\ntwo' },
      { event: 'y', data: 'three' },
    ]);
  });

  it('reassembles events and CRLFs split across chunks', async () => {
    expect(
      await collect(streamOf('ev', 'ent: te', 'xt\r', '\ndata: {"delta":"hi"}\r', '\n\r\n')),
    ).toEqual([{ event: 'text', data: '{"delta":"hi"}' }]);
  });

  it('keeps multi-byte characters split across chunks', async () => {
    const bytes = new TextEncoder().encode('data: Tiếng Việt ✓\n\n');
    expect(await collect(streamOf(bytes.slice(0, 10), bytes.slice(10)))).toEqual([
      { event: 'message', data: 'Tiếng Việt ✓' },
    ]);
  });

  it('drops an unfinished event at the end of the stream', async () => {
    expect(await collect(streamOf('data: complete\n\ndata: cut off'))).toEqual([
      { event: 'message', data: 'complete' },
    ]);
  });

  it('cancels the stream when the consumer stops early', async () => {
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: 1\n\ndata: 2\n\n'));
      },
      cancel() {
        cancelled = true;
      },
    });
    for await (const message of parseSse(stream)) {
      expect(message.data).toBe('1');
      break;
    }
    expect(cancelled).toBe(true);
  });
});
