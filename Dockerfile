FROM node:lts-slim
WORKDIR /app
COPY . /app
RUN npm install --production
ENTRYPOINT [ "node", "bin/reveal-md.js" ]
CMD [ "/slides" ]
