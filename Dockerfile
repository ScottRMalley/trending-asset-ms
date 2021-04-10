FROM node:12.22.1

LABEL authors="Scott Malley <scott.r.malley@gmail.com>"
WORKDIR /www/trending-asset-ms

COPY . .

EXPOSE 8080

CMD ["/bin/bash", "./scripts/entry.sh"]
