FROM node:lts-alpine

COPY package.json package-lock.json /app/

WORKDIR /app

# First install dependencies
RUN npm install --omit=dev

# Install app
COPY . /app

EXPOSE 1948

WORKDIR /slides
ENTRYPOINT [ "node", "/app/bin/reveal-md.js" ]
CMD [ "/slides" ]
