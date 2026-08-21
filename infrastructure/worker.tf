locals {
  standard_custom_domains = concat(
    var.enable_apex_domain ? [var.cloudflare_zone_name] : [],
    var.enable_www_domain ? ["www.${var.cloudflare_zone_name}"] : [],
  )

  custom_domains = toset(concat(
    local.standard_custom_domains,
    tolist(var.additional_custom_domains),
  ))
}

# OpenTofu owns the durable Worker identity and account-level settings. Worker
# versions, deployments, bindings, compatibility settings, and static assets are
# published by Wrangler so application releases do not become infrastructure
# state changes.
resource "cloudflare_worker" "site" {
  account_id = var.cloudflare_account_id
  name       = var.worker_name
  tags       = var.worker_tags

  observability = {
    enabled            = var.worker_observability_enabled
    head_sampling_rate = var.worker_observability_sampling_rate
  }

  subdomain = {
    enabled          = var.workers_dev_enabled
    previews_enabled = var.preview_urls_enabled
  }
}

# A Workers Custom Domain makes the Worker the origin and lets Cloudflare create
# the necessary DNS records and TLS certificates. Do not create separate A/CNAME
# records for these hostnames.
resource "cloudflare_workers_custom_domain" "site" {
  for_each = local.custom_domains

  account_id = var.cloudflare_account_id
  hostname   = each.value
  service    = cloudflare_worker.site.name
  zone_id    = cloudflare_zone.site.id
  zone_name  = cloudflare_zone.site.name
}
