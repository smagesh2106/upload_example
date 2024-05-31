# Use Node.js version 18
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Bundle app source
COPY . .
COPY prisma ./prisma/

# Install app dependencies
RUN apk add openssl3
RUN npm install
RUN npx prisma generate

# Expose the port on which your app runs
EXPOSE 4001

# Define the command to run your app
CMD [ "npm", "start" ]
