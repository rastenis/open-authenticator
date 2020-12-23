
FROM node:15-slim
RUN mkdir -p /app
COPY . /app
WORKDIR /app/

RUN yarn global add typescript pm2

RUN yarn

RUN tsc
EXPOSE 80
CMD yarn run restore && pm2-runtime ./dist/index.js --time