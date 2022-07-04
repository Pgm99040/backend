FROM node:15.1-alpine

WORKDIR /usr/src/appdir
COPY . .

RUN apk add python make g++

RUN npm install
EXPOSE 8080
CMD [ "node", "app.js" ]
