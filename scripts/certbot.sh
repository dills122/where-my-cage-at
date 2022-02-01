#!/bin/bash

domain="wheremycageat.com"
api_sub_domain="api"
ssl_email="dylansteele57@gmail.com"

sudo rm -rf /etc/nginx/conf.d/* && sudo rm -rf /etc/nginx/sites-enabled/default
# Copy Nginx config files
sudo cp ~/app-src/.docker/nginx/conf.d/prod/* /etc/nginx/sites-enabled/

sudo nginx -t

sudo certbot --nginx --non-interactive --agree-tos -d ${domain} -d www.${domain} -d ${api_sub_domain}.${domain} -d www.${api_sub_domain}.${domain} -m ${ssl_email}
