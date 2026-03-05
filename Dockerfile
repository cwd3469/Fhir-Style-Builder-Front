# 빌드 스테이지
FROM node:18-alpine AS builder

# pnpm 활성화
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 의존성 먼저 복사 — 레이어 캐싱 활용
COPY package.json pnpm-lock.yaml .

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스코드 복사
COPY . .

# 환경변수 — 빌드 시점에 필요
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Next.js 빌드
RUN pnpm build

# 실행 스테이지 — 빌드 결과물만 가져옴
FROM node:18-alpine AS runner

# pnpm 활성화
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 빌드 결과물 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# 프로덕션 의존성만 설치
RUN pnpm install --frozen-lockfile --prod

# 포트 노출
EXPOSE 3000

# 서버 실행
CMD ["pnpm", "start"]