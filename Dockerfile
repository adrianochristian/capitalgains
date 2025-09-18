FROM node:20-alpine

WORKDIR /app


COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY bin ./bin
COPY cases ./cases

ENTRYPOINT ["node", "./bin/capital-gains"]

