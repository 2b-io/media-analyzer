FROM node:carbon

# Create app directory
WORKDIR /usr/src

RUN npm install -g yarn
