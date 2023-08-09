FROM node:16-alpine

#Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install FFMPEG
RUN apk update
RUN apk upgrade
RUN apk add --no-cache ffmpeg

# RUN npm install
# If you are building your code for production
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD [ "node", "app.js" ]