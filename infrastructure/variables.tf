variable "cloudflare_account_id" {
  description = "Cloudflare account ID that owns the Worker. This is an identifier, not a secret."
  type        = string

  validation {
    condition     = can(regex("^[0-9a-fA-F]{32}$", var.cloudflare_account_id))
    error_message = "cloudflare_account_id must be a 32-character hexadecimal Cloudflare account ID."
  }
}

variable "cloudflare_zone_name" {
  description = "DNS name of the full Cloudflare zone OpenTofu will manage, without a scheme or trailing dot."
  type        = string

  validation {
    condition = (
      length(trimspace(var.cloudflare_zone_name)) > 0 &&
      !startswith(var.cloudflare_zone_name, "http://") &&
      !startswith(var.cloudflare_zone_name, "https://") &&
      !endswith(var.cloudflare_zone_name, ".")
    )
    error_message = "cloudflare_zone_name must be a bare DNS name without a scheme or trailing dot."
  }
}

variable "worker_name" {
  description = "Stable Worker service name. Wrangler must deploy static assets to this exact name."
  type        = string
  default     = "where-my-cage-at"

  validation {
    condition = (
      length(var.worker_name) >= 1 &&
      length(var.worker_name) <= 63 &&
      can(regex("^[a-z0-9][a-z0-9_-]*$", var.worker_name))
    )
    error_message = "worker_name must be 1-63 lowercase letters, numbers, hyphens, or underscores and start with a letter or number."
  }
}

variable "worker_tags" {
  description = "Tags applied to the Worker identity."
  type        = set(string)
  default     = ["app:where-my-cage-at", "environment:production", "managed-by:opentofu"]
}

variable "workers_dev_enabled" {
  description = "Whether the production Worker remains reachable from its workers.dev URL."
  type        = bool
  default     = false
}

variable "preview_urls_enabled" {
  description = "Whether version-specific workers.dev preview URLs are enabled."
  type        = bool
  default     = true
}

variable "worker_observability_enabled" {
  description = "Enable Cloudflare Workers observability for the service."
  type        = bool
  default     = true
}

variable "worker_observability_sampling_rate" {
  description = "Fraction of Worker requests retained by observability, from 0 to 1."
  type        = number
  default     = 1

  validation {
    condition = (
      var.worker_observability_sampling_rate >= 0 &&
      var.worker_observability_sampling_rate <= 1
    )
    error_message = "worker_observability_sampling_rate must be between 0 and 1."
  }
}

variable "enable_apex_domain" {
  description = "Attach the zone apex to the Worker as a custom domain."
  type        = bool
  default     = true
}

variable "enable_www_domain" {
  description = "Attach www.<zone> to the Worker as a custom domain."
  type        = bool
  default     = true
}

variable "additional_custom_domains" {
  description = "Additional hostnames in the same zone to attach to the Worker."
  type        = set(string)
  default     = []

  validation {
    condition = alltrue([
      for hostname in var.additional_custom_domains :
      hostname == var.cloudflare_zone_name || endswith(hostname, ".${var.cloudflare_zone_name}")
    ])
    error_message = "Every additional custom domain must be the zone apex or one of its subdomains."
  }
}
