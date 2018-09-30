FROM php:7.1-apache


# Enable apache modules
RUN a2enmod rewrite headers
#

WORKDIR /

COPY socket.php /socket.php

CMD php ./socket.php


