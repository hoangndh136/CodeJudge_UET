FROM ruby:2.7.1-alpine3.12

RUN apk add --no-cache bc
RUN apk add --update coreutils && rm -rf /var/cache/apk/*

WORKDIR /home/compile/

ADD script.sh /bin/script.sh
RUN chmod +x /bin/script.sh

ENTRYPOINT ["sh", "/bin/script.sh"]