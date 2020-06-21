FROM perl:5.20

WORKDIR /home/compile/

ADD script.sh /bin/script.sh
RUN chmod +x /bin/script.sh

ENTRYPOINT ["sh", "/bin/script.sh"]