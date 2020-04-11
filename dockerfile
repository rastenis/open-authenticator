
FROM node:10-slim
RUN mkdir -p /app
COPY . /app
WORKDIR /app/

RUN apt-get update && \
    apt-get install -y \
    git \
    openssh-server \
    openssh-client

RUN yarn global add typescript pm2

RUN yarn

RUN tsc
EXPOSE 3001
CMD pm2-runtime ./dist/index.js --time