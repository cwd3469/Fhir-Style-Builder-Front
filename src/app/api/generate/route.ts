import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const buildPrompt = (prompt: string, techStack: string) => `
You are an expert ${techStack} developer.
Generate a clean, working component based on this requirement: ${prompt}

Rules:
- Return ONLY the code, no explanation
- Use TypeScript
- Consider accessibility (aria attributes)
- Use Tailwind CSS for styling
- Make it visually appealing
`;

export async function POST(req: Request) {
  const { prompt, techStack } = await req.json();

  // 스트리밍 응답 설정
  const stream = new ReadableStream({
    async start(controller) {
      const response = await anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: buildPrompt(prompt, techStack),
          },
        ],
      });

      for await (const chunk of response) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(chunk.delta.text);
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
