FROM node:20

EXPOSE 4000

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

CMD if [ -f "init.sh" ]; then sh init.sh; fi && npm run start:prod
