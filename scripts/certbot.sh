#!/bin/bash

domain="wheremycageat.com"
api_sub_domain="api"
ssl_email="dylansteele57@gmail.com"

#TODO fix issue with nginx config/ cert install; cant have listen 80 and 443 in same server, certbot doesnt remove the 80
sudo rm -rf /etc/nginx/conf.d/* && sudo rm -rf /etc/nginx/sites-enabled/default
# Copy Nginx config files
sudo cp ~/app-src/.docker/nginx/conf.d/prod/* /etc/nginx/sites-enabled/

sudo nginx -t

sudo certbot --nginx --non-interactive --agree-tos --redirect -d ${domain} -d www.${domain} -d ${api_sub_domain}.${domain} -d www.${api_sub_domain}.${domain} -m ${ssl_email}
