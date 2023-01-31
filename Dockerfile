FROM node:14.15.4-slim

RUN mkdir -p /usr/src/nuxt

COPY . /usr/src/nuxt

WORKDIR /usr/src/nuxt

RUN npm install

ENV NUXT_PORT=8080
ENV NUXT_HOST=0.0.0.0
ENV NUXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development
ENV CW_WS_URL=/api/ws

RUN npm run build

EXPOSE 8080

CMD [ "npm","run","start" ]
