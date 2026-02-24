"use client";

import {useEffect, useRef, useState} from "react";

interface CodePreviewProps {
  code: string;
}

export default function CodePreview({ code }: CodePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code || !iframeRef.current) return;

    try {
      // React 코드를 실행 가능한 HTML로 변환
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { padding: 20px; background: white; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    
    // 컴포넌트 마운트 (export default 추출)
    const match = \`${code}\`.match(/export default function (\\w+)/);
    if (match) {
      const ComponentName = match[1];
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(eval(ComponentName)));
    }
  </script>
</body>
</html>
      `;

      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "렌더링 실패");
    }
  }, [code]);

  return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">
          Live Preview
        </span>
          {error && (
              <span className="text-xs text-red-400">⚠️ {error}</span>
          )}
        </div>
        <iframe
            ref={iframeRef}
            className="flex-1 bg-white rounded-lg border border-gray-700"
            sandbox="allow-scripts"
            title="Component Preview"
        />
      </div>
  );
}