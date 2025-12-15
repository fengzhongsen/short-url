FROM node:16-alpine

WORKDIR /app

COPY . .

RUN npm install && npm run build

EXPOSE 3001

CMD ["npm", "run", "server"]