import { NextRequest } from 'next/server';
import { analyzeWithQwen } from '../qwen';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: '文本内容不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Set up streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start processing in the background
    (async () => {
      try {
        let fullText = '';
        for await (const chunk of analyzeWithQwen(text)) {
          fullText += chunk;
          const message = {
            type: 'chunk',
            content: fullText,
            rawChunk: chunk,
            timestamp: new Date().toISOString()
          };
          await writer.write(
            encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          );
        }
      } catch (error) {
        console.error('Streaming error:', error);
        const errorMessage = {
          type: 'error',
          error: error instanceof Error ? error.message : '分析失败',
          timestamp: new Date().toISOString()
        };
        await writer.write(
          encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`)
        );
      } finally {
        const endMessage = {
          type: 'end',
          timestamp: new Date().toISOString()
        };
        await writer.write(
          encoder.encode(`data: ${JSON.stringify(endMessage)}\n\n`)
        );
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : '分析失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
