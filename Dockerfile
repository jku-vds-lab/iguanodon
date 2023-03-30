FROM nginx:stable-alpine-slim
LABEL maintainer="klaus.eckelt@jku.at"

COPY dist /usr/share/nginx/html

EXPOSE 80

# 1. Build to dist/
# 2. Push to AWS
#   aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 478950388974.dkr.ecr.eu-central-1.amazonaws.com
#   docker build -t iguanodon .
#   docker tag iguanodon:latest 478950388974.dkr.ecr.eu-central-1.amazonaws.com/iguanodon:latest
#   docker push 478950388974.dkr.ecr.eu-central-1.amazonaws.com/iguanodon:latest