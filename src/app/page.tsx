'use client';

import React, { useEffect, useRef, useState } from 'react';

interface FhirQuestionnaireRequest {
  questionnaire: Record<string, unknown>;
  component_name: string;
  style_lib: 'tailwind' | 'emotion' | 'css-module';
}

interface FhirComponentResponse {
  component_code: string;
  preview_html: string;
  component_name: string;
  fhir_item_count: number;
  warnings: string[];
}

const Page = () => {
  const [schema, setSchema] = useState<string>('');
  const [componentName, setComponentName] = useState<string>('PatientForm');
  const [result, setResult] = useState<FhirComponentResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleGenerate = async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage('');
    setResult(null);

    let parsedQuestionnaire: Record<string, unknown> = {};
    let isParseSuccess: boolean = true;

    try {
      parsedQuestionnaire = JSON.parse(schema);
    } catch (parseError) {
      isParseSuccess = false;
      setErrorMessage('유효하지 않은 JSON 형식입니다.');
    }

    if (!isParseSuccess) {
      setIsLoading(false);
      return;
    }

    const request: FhirQuestionnaireRequest = {
      questionnaire: parsedQuestionnaire,
      component_name: componentName,
      style_lib: 'tailwind',
    };

    let isFetchSuccess: boolean = true;

    try {
      const apiUrl: string = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/fhir/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        isFetchSuccess = false;
        setErrorMessage(`서버 오류: ${response.status}`);
      }

      if (isFetchSuccess) {
        const jsonData: FhirComponentResponse = await response.json();
        setResult(jsonData);
      }
    } catch (fetchError) {
      setErrorMessage('API 호출 실패: 서버 연결을 확인하세요.');
    }

    setIsLoading(false);
  };

  // result 변경 시 preview_html을 blob URL로 iframe에 주입
  useEffect(() => {
    if (!result || !iframeRef.current) return;

    const blob: Blob = new Blob([result.preview_html], { type: 'text/html' });
    const blobUrl: string = URL.createObjectURL(blob);

    iframeRef.current.src = blobUrl;

    // 메모리 누수 방지
    return () => {
      URL.revokeObjectURL(blobUrl);
    };
  }, [result]);

  // TSX 파일 다운로드
  const handleDownload = (): void => {
    if (!result) return;

    const blob: Blob = new Blob([result.component_code], { type: 'text/plain' });
    const url: string = URL.createObjectURL(blob);
    const anchor: HTMLAnchorElement = document.createElement('a');

    anchor.href = url;
    anchor.download = `${result.component_name}.tsx`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col bg-blue-800 p-5 gap-5 min-h-screen">
      {/* 헤더 */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">FHIR Form Builder AI</h1>
        <p className="text-gray-400 mt-1">
          FHIR Questionnaire 스키마 → React 문진 컴포넌트 자동 생성
        </p>
      </div>

      {/* 컴포넌트 이름 입력 */}
      <input
        type="text"
        value={componentName}
        onChange={(e) => setComponentName(e.target.value)}
        className="w-full px-4 py-2 bg-white rounded-lg text-black font-mono text-sm"
        placeholder="컴포넌트 이름 (PascalCase) ex) PatientForm"
      />

      {/* 에러 메시지 */}
      {errorMessage && (
        <div className="w-full px-4 py-2 bg-red-500 text-white rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-between flex-1 gap-5">
        {/* 왼쪽: FHIR JSON 입력 */}
        <div className="basis-1/2 flex flex-col gap-5">
          <textarea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            className="flex-1 min-h-96 bg-white border border-gray-700 rounded-lg p-4
                       font-mono text-sm text-black resize-none
                       focus:outline-none focus:border-blue-500"
            placeholder="FHIR Questionnaire JSON을 입력하세요..."
            spellCheck={false}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !schema.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500
                       disabled:bg-gray-700 disabled:cursor-not-allowed
                       rounded-lg font-medium text-white transition-colors"
          >
            {isLoading ? '⚡ 생성 중...' : '🚀 컴포넌트 생성'}
          </button>
        </div>

        {/* 오른쪽: 미리보기 + 다운로드 */}
        <div className="basis-1/2 flex flex-col gap-3">
          {result ? (
            <>
              {/* 메타 정보 + 다운로드 버튼 */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-sm text-white">
                  <span>컴포넌트: {result.component_name}</span>
                  <span>FHIR items: {result.fhir_item_count}</span>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500
                             rounded-lg text-sm text-white font-medium transition-colors"
                >
                  ⬇️ {result.component_name}.tsx 다운로드
                </button>
              </div>

              {/* warnings */}
              {result.warnings.length > 0 && (
                <div className="px-3 py-2 bg-yellow-500 text-black rounded-lg text-sm">
                  {result.warnings.map((warning: string, index: number) => (
                    <div key={index}>{warning}</div>
                  ))}
                </div>
              )}

              {/* iframe 미리보기 — preview_html blob URL 주입 */}
              <iframe
                ref={iframeRef}
                className="w-full bg-white rounded-lg"
                style={{ height: '500px', border: 'none' }}
                sandbox="allow-scripts"
                title="컴포넌트 미리보기"
              />
            </>
          ) : (
            <div className="flex-1 min-h-96 bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 text-sm">생성된 컴포넌트가 여기에 표시됩니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
