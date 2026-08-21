terraform {
  required_version = "~> 1.12.0"

  # Supply the R2/S3-compatible backend settings at init time. Keeping them out
  # of source control prevents backend credentials and account IDs from leaking.
  backend "s3" {}

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.23.0"
    }
  }
}

provider "cloudflare" {}
