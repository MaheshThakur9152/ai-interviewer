FROM node:22-alpine as build

WORKDIR /app

ARG VITE_API_URL

ENV VITE_API_URL=$VITE_API_URL

COPY frontend/package*.json ./

RUN npm install

COPY frontend/ .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]