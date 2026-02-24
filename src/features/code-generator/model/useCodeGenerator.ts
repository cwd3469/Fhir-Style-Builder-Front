import { useState } from 'react';
import { TechStack } from '@/entities/generation/types';

export const useCodeGenerator = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (prompt: string, techStack: TechStack) => {
    setIsLoading(true);
    setCode('');
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, techStack }),
      });

      if (!res.body) throw new Error('No response body');

      // 스트리밍 읽기
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setCode((prev) => prev + decoder.decode(value));
      }
    } catch (err) {
      setError('코드 생성 중 오류가 발생했어요.');
    } finally {
      setIsLoading(false);
    }
  };

  return { code, isLoading, error, generate };
};
