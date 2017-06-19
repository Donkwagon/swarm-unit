FROM node:6.10.1

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --global npm@3.10.10

# Bundle app source
COPY . /usr/src/app

EXPOSE 8200
CMD [ "npm", "start" ]