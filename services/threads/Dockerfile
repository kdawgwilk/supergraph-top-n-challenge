FROM node:20

EXPOSE 4001

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

CMD npm start
