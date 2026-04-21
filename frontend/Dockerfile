FROM node:22-slim

WORKDIR /frontendapp

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5174

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5174"]
