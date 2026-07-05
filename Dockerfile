FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/.agent ./.agent
COPY --from=build /app/specs ./specs
COPY --from=build /app/docs ./docs
COPY --from=build /app/skills ./skills
RUN npm ci --omit=dev
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
