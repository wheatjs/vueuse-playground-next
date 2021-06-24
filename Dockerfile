FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
#COPY package*.json ./


RUN npm install -g pnpm

RUN pnpm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
#COPY . .
COPY . .

EXPOSE 4000
CMD [ "npm", "run server:serve" ]
