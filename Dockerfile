FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["npx", "expo", "start"]
