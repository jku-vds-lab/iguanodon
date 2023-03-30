FROM nginx:stable-alpine-slim
LABEL maintainer="klaus.eckelt@jku.at"

COPY dist /usr/share/nginx/html

EXPOSE 80