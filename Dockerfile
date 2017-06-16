FROM node:4-onbuild
EXPOSE 8200
RUN mkdir -p /usr/src/app  
WORKDIR /usr/src/app  
ADD . /usr/src/app  
RUN npm install  
CMD ["npm", "start"]