output "zone" {
  description = "Cloudflare zone identity and activation status."
  value = {
    id     = cloudflare_zone.site.id
    name   = cloudflare_zone.site.name
    status = cloudflare_zone.site.status
    type   = cloudflare_zone.site.type
  }
}

output "registrar_name_servers" {
  description = "Cloudflare nameservers to configure at the domain registrar after zone creation."
  value       = cloudflare_zone.site.name_servers
}

output "worker" {
  description = "Durable Worker identity consumed by the Wrangler deployment pipeline."
  value = {
    id   = cloudflare_worker.site.id
    name = cloudflare_worker.site.name
  }
}

output "custom_domains" {
  description = "Custom-domain IDs and certificate IDs managed by Cloudflare."
  value = {
    for hostname, domain in cloudflare_workers_custom_domain.site : hostname => {
      id             = domain.id
      certificate_id = domain.cert_id
    }
  }
}

output "production_urls" {
  description = "Public URLs routed to the Worker after the first Wrangler deployment."
  value       = [for hostname in sort(tolist(local.custom_domains)) : "https://${hostname}"]
}

output "wrangler_worker_name" {
  description = "Pass this exact value to Wrangler's name setting or --name flag."
  value       = cloudflare_worker.site.name
}
