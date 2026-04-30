FROM node:22-slim


WORKDIR /usr/src/postApp/

COPY package.json .

RUN npm install

COPY . .

EXPOSE  3000


CMD [ "node", "main.js" ]