# using https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:14.17.0

WORKDIR /opt/app/
COPY src /opt/app/

RUN npm install

# ENTRYPOINT ["node", "/opt/app/app.js"]
ENTRYPOINT ["npm", "run", "piano"]