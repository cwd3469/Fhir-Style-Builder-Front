# [빌드 스테이지]
FROM node:20-alpine AS builder

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 먼저 설치 (캐시 최적화)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 소스코드 복사 및 빌드
COPY . .
RUN pnpm build

# [실행 스테이지] 빌드 결과물만 가져와서 이미지 크기 최소화
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

CMD ["pnpm", "start"]
