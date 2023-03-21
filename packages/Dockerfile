# Stage 1
FROM node:19-alpine as build-step

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh nano zopfli
 
RUN npm i -g pnpm
RUN npm i -g typescript

RUN mkdir -p /app/packages/notest-common
WORKDIR /app/packages/notest-common
COPY ./notest-common/package.json .
COPY ./notest-common/pnpm-lock.yaml .
RUN pnpm i

RUN mkdir -p /app/packages/notest-backend-shared
WORKDIR /app/packages/notest-backend-shared
COPY ./notest-backend-shared/package.json .
COPY ./notest-backend-shared/pnpm-lock.yaml .
RUN pnpm i

RUN mkdir -p /app/packages/notest-backend
WORKDIR /app/packages/notest-backend
COPY ./notest-backend/package.json .
COPY ./notest-backend/pnpm-lock.yaml .
COPY ./notest-backend/.npmrc .
RUN pnpm i

WORKDIR /app/packages/notest-common
COPY ./notest-common/. .
RUN pnpm build

WORKDIR /app/packages/notest-backend-shared
COPY ./notest-backend-shared/. .
RUN pnpm build:prod

WORKDIR /app/packages/notest-backend
COPY ./notest-backend/. .
RUN pnpm build

EXPOSE 3005

WORKDIR /app/packages/notest-backend

CMD ["node", "dist/main.js"]
