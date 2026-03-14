FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY scripts ./scripts

EXPOSE 3001
CMD ["npm", "run", "start"]
