# The domain registration remains at its registrar, while OpenTofu owns the
# Cloudflare full-zone lifecycle. After creation, configure the registrar with
# the assigned nameservers exposed by registrar_name_servers.
resource "cloudflare_zone" "site" {
  account = {
    id = var.cloudflare_account_id
  }

  name = var.cloudflare_zone_name
  type = "full"
}
