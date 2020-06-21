FROM chug/ubuntu14.04x64 
RUN apt-get update
RUN apt-get install -y gcc
RUN apt-get install -y g++

WORKDIR /bin/

ADD script.sh /bin/script.sh
RUN chmod +x /bin/script.sh

ENTRYPOINT ["sh", "/bin/script.sh"]