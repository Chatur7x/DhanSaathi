FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install ALL deps (incl. dev) so `npm run build` (tsc) works, then prune.
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build && npm prune --omit=dev

EXPOSE 5001

ENV NODE_ENV=production
ENV PORT=5001

CMD ["node", "dist/server.js"]