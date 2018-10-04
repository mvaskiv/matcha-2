FROM php:7.1-apache

RUN apt-get -y update --fix-missing
RUN apt-get upgrade -y

RUN apt-get -y install libsqlite3-dev libsqlite3-0 mysql-client
RUN docker-php-ext-install pdo_mysql 
RUN docker-php-ext-install pdo_sqlite
RUN docker-php-ext-install mysqli

RUN apt-get -y install sendmail
RUN apt-get install -q -y ssmtp mailutils

# root is the person who gets all mail for userids < 1000
RUN echo "root=no-reply@matcha.pp.ua" >> /etc/ssmtp/ssmtp.conf

# Here is the gmail configuration (or change it to your private smtp server)
RUN echo "mailhub=mail.adm.tools:2525" >> /etc/ssmtp/ssmtp.conf
RUN echo "AuthUser=no-reply@matcha.pp.ua" >> /etc/ssmtp/ssmtp.conf
RUN echo "AuthPass=A1qwerty" >> /etc/ssmtp/ssmtp.conf

RUN echo "UseTLS=YES" >> /etc/ssmtp/ssmtp.conf
RUN echo "UseSTARTTLS=YES" >> /etc/ssmtp/ssmtp.conf
RUN echo "rewriteDomain=matcha.pp.ua" >> /etc/ssmtp/ssmtp.conf
RUN echo "FromLineOverride=yes" >> /etc/ssmtp/ssmtp.conf

# Set up php sendmail config
EXPOSE 2525
RUN echo "sendmail_path=sendmail -i -t" >> /usr/local/etc/php/conf.d/php-sendmail.ini

# Enable apache modules
RUN a2enmod rewrite headers
