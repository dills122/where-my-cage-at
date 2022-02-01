#!/bin/bash

domain="wheremycageat.com"
api_sub_domain="api"
ssl_email="dylansteele57@gmail.com"

sudo mkdir -p /var/www/prod

sudo certbot --nginx --non-interactive --webroot -w /var/www/prod/ --agree-tos -d ${domain} -d www.${domain} -d ${api_sub_domain}.${domain} -d www.${api_sub_domain}.${domain} -m ${ssl_email}
