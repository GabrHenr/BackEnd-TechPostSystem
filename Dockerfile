FROM node:22-slim


WORKDIR /postApp

COPY package.json .

RUN npm install

EXPOSE  3000


CMD [ "node", "main.js" ]