FROM php:7.4-cli-alpine

RUN apk add --no-cache bc
RUN apk add --update coreutils && rm -rf /var/cache/apk/*

WORKDIR /home/compile/

ADD script.sh /bin/script.sh
RUN chmod +x /bin/script.sh

ENTRYPOINT ["sh", "/bin/script.sh"]