FROM gcc

RUN apt-get update
RUN apt-get install gcc

WORKDIR /home/compile/

ADD script.sh /bin/script.sh
RUN chmod +x /bin/script.sh

ENTRYPOINT ["sh", "/bin/script.sh"]