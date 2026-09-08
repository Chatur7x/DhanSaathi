FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

EXPOSE 5001

ENV NODE_ENV=production
ENV PORT=5001

CMD ["node", "dist/server.js"]