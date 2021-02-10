FROM node:12-alpine AS ui-build
WORKDIR /usr/src/app
COPY merchantapp/ ./merchantapp/
RUN cd merchantapp && npm install && npm rebuild node-sass && npm run build

FROM node:12-alpine as server-build
WORKDIR /usr/src/api
COPY api/src/ ./src/
COPY api/package*.json ./
COPY api/.babelrc ./
RUN npm install && npm run build

FROM node:12-alpine AS app-deploy
WORKDIR /root/
COPY --from=ui-build /usr/src/app/merchantapp/dist ./merchantapp/dist
COPY --from=server-build /usr/src/api/dist ./api/
COPY api/package*.json ./api/
RUN cd api && npm install

CMD ["node", "./api/server.js"]