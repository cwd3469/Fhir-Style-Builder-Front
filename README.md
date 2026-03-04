# FHIR Form Builder AI — Frontend

> FHIR R5 Questionnaire JSON 입력 → Claude AI → React 문진 컴포넌트 실시간 미리보기

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Sandpack](https://img.shields.io/badge/Sandpack-CodeSandbox-151515?style=flat-square&logo=codesandbox&logoColor=white)

---

## 데모

> GIF 데모 이미지 삽입 위치
> `![demo](./docs/demo.gif)`

---

## 프로젝트 개요

FHIR R5 Questionnaire JSON을 입력하면 Claude AI가 React TypeScript 컴포넌트를 자동 생성하고,  
**Sandpack을 통해 브라우저에서 즉시 렌더링 결과를 미리볼 수 있는** 인터랙티브 폼 빌더다.

### 핵심 플로우

```
FHIR JSON 입력 (textarea)
        ↓
FastAPI /fhir/generate 호출
        ↓
Claude AI TSX 코드 생성
        ↓
Sandpack 실시간 미리보기
```

---

## 기술 스택

| 영역 | 기술 | 선택 이유 |
|------|------|-----------|
| Framework | Next.js 14 | App Router, SSR |
| Language | TypeScript | FHIR 타입 안전성 |
| Style | Tailwind CSS | 빠른 UI 개발 |
| 코드 미리보기 | Sandpack | 브라우저 내 TSX 컴파일 |

---

## 프로젝트 구조

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 메인 페이지 — FHIR 입력 + 미리보기
│   │   └── layout.tsx            # 레이아웃
│   └── features/
│       └── fhir-generator/
│           └── ui/
│               └── fhir-text-editor.tsx
```

---

## 핵심 기능

### 1. FHIR JSON 입력 + 유효성 검증
```typescript
// textarea 입력 → JSON.parse → FastAPI 전송
let parsedQuestionnaire: Record<string, unknown> = {};

try {
  parsedQuestionnaire = JSON.parse(schema);
} catch (parseError) {
  setErrorMessage('유효하지 않은 JSON 형식입니다.');
}
```

### 2. Sandpack 실시간 미리보기
```typescript
// 생성된 TSX 코드를 Sandpack으로 즉시 렌더링
<SandpackProvider
  template="react-ts"
  files={{
    '/PatientForm.tsx': result.component_code,
    '/App.tsx': `import PatientForm from './PatientForm'; ...`
  }}
  options={{
    externalResources: ['https://cdn.tailwindcss.com']
  }}
>
  <SandpackCodeEditor />  // 생성된 코드 확인
  <SandpackPreview />     // 실제 렌더링 미리보기
</SandpackProvider>
```

---

## 시작하기

### 요구사항
- Node.js 18+
- Backend 서버 실행 중 ([Fhir-Style-Builder](https://github.com/cwd3469/Fhir-Style-Builder))

### 설치

```bash
# 레포 클론
git clone https://github.com/cwd3469/Fhir-Style-Builder-Front.git
cd Fhir-Style-Builder-Front

# 의존성 설치
npm install
```

### 환경변수 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000` 접속

---

## 사용 방법

1. 컴포넌트 이름 입력 (PascalCase) — ex) `PatientForm`
2. 좌측 textarea에 FHIR R5 Questionnaire JSON 입력
3. `🚀 컴포넌트 생성` 버튼 클릭
4. 우측 패널에서 생성된 TSX 코드 확인
5. 하단 미리보기에서 실제 렌더링 결과 확인

### 테스트용 FHIR JSON

```json
{
  "resourceType": "Questionnaire",
  "status": "active",
  "item": [
    {"linkId": "1", "text": "환자 이름", "type": "string", "required": true},
    {"linkId": "2", "text": "생년월일", "type": "date", "required": true},
    {"linkId": "3", "text": "흡연 여부", "type": "boolean", "required": false}
  ]
}
```

---

## 관련 레포

- **Backend**: [Fhir-Style-Builder](https://github.com/cwd3469/Fhir-Style-Builder)
