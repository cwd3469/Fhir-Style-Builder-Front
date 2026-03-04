'use client';

import React, { useState } from 'react';
import { SandpackCodeEditor, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react';

// FastAPI schemas/fhir.py 와 1:1 매핑
interface FhirQuestionnaireRequest {
  questionnaire: Record<string, unknown>;
  component_name: string;
  style_lib: 'tailwind' | 'emotion' | 'css-module';
}

interface FhirComponentResponse {
  component_code: string;
  component_name: string;
  fhir_item_count: number;
  warnings: string[];
}

const Page = () => {
  // textarea에 입력된 FHIR JSON 문자열
  const [schema, setSchema] = useState<string>('');
  // 컴포넌트 이름 입력
  const [componentName, setComponentName] = useState<string>('PatientForm');
  // Claude API 응답 결과
  const [result, setResult] = useState<FhirComponentResponse | null>(null);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 에러 메시지
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleGenerate = async (): Promise<void> => {
    // 상태 초기화
    setIsLoading(true);
    setErrorMessage('');
    setResult(null);

    // 1. textarea 문자열 → JSON 파싱
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

    // 2. 요청 객체 구성
    const request: FhirQuestionnaireRequest = {
      questionnaire: parsedQuestionnaire,
      component_name: componentName,
      style_lib: 'tailwind',
    };

    // 3. FastAPI 호출
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

        {/* 오른쪽: 생성된 코드 출력 */}
        <div className="basis-1/2 flex flex-col gap-3">
          {result ? (
            <>
              {/* 메타 정보 */}
              <div className="flex gap-3 text-sm text-white">
                <span>컴포넌트: {result.component_name}</span>
                <span>FHIR items: {result.fhir_item_count}</span>
              </div>

              {/* warnings */}
              {result.warnings.length > 0 && (
                <div className="px-3 py-2 bg-yellow-500 text-black rounded-lg text-sm">
                  {result.warnings.map((warning: string, index: number) => (
                    <div key={index}>{warning}</div>
                  ))}
                </div>
              )}

              {/* Sandpack: 코드 에디터 + 미리보기 */}
              <SandpackProvider
                template="react-ts"
                files={{
                  // 루트 경로로 통일
                  '/PatientForm.tsx': result.component_code,
                  '/App.tsx': `
import ${result.component_name} from './PatientForm';

export default function App() {
  return (
    <div className="p-4">
      <${result.component_name} />
    </div>
  );
}
    `.trim(),
                }}
                options={{
                  externalResources: ['https://cdn.tailwindcss.com'],
                }}
                theme="dark"
              >
                {/* 탭: 코드 보기 / 미리보기 전환 */}
                <div className="flex flex-col gap-2 flex-1">
                  <SandpackCodeEditor
                    style={{ height: '300px', borderRadius: '8px' }}
                    showTabs
                    showLineNumbers
                    readOnly
                  />
                  <SandpackPreview
                    style={{ height: '300px', borderRadius: '8px' }}
                    showNavigator={false}
                  />
                </div>
              </SandpackProvider>
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
