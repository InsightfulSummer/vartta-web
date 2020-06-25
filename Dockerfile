FROM node:14

ENV HOST=0.0.0.0

EXPOSE 4050
WORKDIR /usr/src/app

COPY package.json yarn.lock /usr/src/app/
RUN yarn install --frozen-lockfile --non-interactive

COPY . /usr/src/app
RUN yarn build

CMD yarn start
