#!/bin/bash

func() {
    local domain = "wheremycageat.com"
    local api_sub_domain = "api"
    local ssl_email = "dylansteele57@gmail.com"

    mkdir -p /var/www/prod

    sudo certbot --nginx --non-interactive --webroot -w /var/www/prod/ --agree-tos -d ${domain} -d www.${domain} -d ${api_sub_domain}.${domain} -d www.${api_sub_domain}.${domain} -m ${ssl_email}
}

func
