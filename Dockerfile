FROM node:20

WORKDIR /opt/app

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    make \
    g++ \
    libvips-dev

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN npm run build

RUN mkdir -p /opt/app/public/uploads

ENV NODE_ENV=production
ENV STRAPI_DISABLE_ADMIN_PANEL=true

EXPOSE 1337

CMD ["npm", "run", "start"]