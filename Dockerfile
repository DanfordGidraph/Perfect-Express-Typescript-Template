ARG NODE_VERSION=20.13.1

FROM node:${NODE_VERSION}-alpine AS node
FROM alpine as builder

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

ADD . /app
WORKDIR /app
COPY .yarn/ ./
COPY package.json .yarnrc.yml tsconfig.json register.js ./

RUN apk add --update curl
RUN node -v
RUN npm install -g yarn --force
RUN yarn -v
RUN corepack enable
RUN yarn set version berry
RUN yarn
RUN yarn build
ENV NODE_ENV=production
RUN curl -sf https://gobinaries.com/tj/node-prune | /bin/sh && node-prune

FROM alpine as runner
COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

ADD . /app
WORKDIR /app

COPY --from=builder /app /app
COPY --from=builder /app/express /app/express
COPY --from=builder /app/express/data /app/express/data
COPY --from=builder /app/express/assets /app/express/assets
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/.yarnrc.yml /app/.yarnrc.yml
COPY --from=builder /app/register.js /app/register.js

RUN npm install -g yarn --force
RUN yarn -v
RUN corepack enable

EXPOSE 8080

CMD [ "yarn", "start"]