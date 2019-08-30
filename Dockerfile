FROM node:lts-slim

WORKDIR /app

COPY . /app

RUN npm install --production

EXPOSE 1948

ENTRYPOINT [ "node", "bin/reveal-md.js" ]
CMD [ "/slides" ]
