# Cloudflare infrastructure

This OpenTofu stack replaces the legacy DigitalOcean Droplet with the durable
Cloudflare resources needed by the static Angular application.

## Ownership boundary

| OpenTofu owns | Wrangler/application deployment owns |
| --- | --- |
| Full Cloudflare zone lifecycle | Domain registration and registrar nameserver changes |
| Worker identity and stable name | Angular build output and catalogue JSON |
| Worker observability and `workers.dev` settings | Worker versions and deployments |
| Apex, `www`, and optional custom-domain attachments | Static asset upload and asset routing |
| Custom-domain DNS records and TLS certificates (created by Cloudflare) | Compatibility date, bindings, and release-specific settings |

The stack deliberately does **not** upload compiled files. Cloudflare supports
declaring a Worker independently of its versions/deployments, which lets
Wrangler remain the application release tool without putting build artifacts in
OpenTofu state.

Resources managed here:

- `cloudflare_zone.site`
- `cloudflare_worker.site`
- one `cloudflare_workers_custom_domain.site` instance per enabled hostname

OpenTofu creates a full Cloudflare zone and outputs its assigned nameservers for
configuration at the domain registrar. Workers Custom Domains make the Worker
the origin, and Cloudflare creates the corresponding DNS records and TLS
certificates. Do not add separate A or CNAME records for the same hostnames.

## Prerequisites

- OpenTofu `1.12.x`
- A registered domain and a Cloudflare account that will own its full zone
- A Cloudflare API token supplied as `CLOUDFLARE_API_TOKEN`
- `Zone: Zone: Edit` permission scoped to all zones in the target account (the
  zone does not exist when the token first creates it)
- `Account: Workers Scripts: Edit` permission for the target account
- The account ID and zone name

Cloudflare identifiers are not secrets, but local values files are ignored to
avoid coupling the repository to one account. Never put API or R2 token values in
an HCL file.

## Validate without credentials

Pull-request CI only downloads the provider and validates the configuration; it
does not contact the Cloudflare API or initialize remote state.

```bash
cd infrastructure
tofu fmt -check -recursive
tofu init -backend=false -input=false
tofu validate
```

The repository pins `cloudflare/cloudflare` to `5.23.0` and commits the provider
lock file, so local and CI validation use the same provider release.

## Configure production values

```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
```

Replace the example account ID and zone name. The local
`terraform.tfvars` file is ignored by Git.

`worker_name` is a shared contract: the Wrangler configuration or deploy command
must use exactly the same name. Wrangler should not declare routes or custom
domains because OpenTofu owns those resources. Keep Wrangler's `workers_dev` and
preview URL settings aligned with the values in this stack to avoid drift.

## Bootstrap remote state in R2

The state bucket cannot manage itself before it exists. Create a dedicated R2
bucket once with Wrangler, the Cloudflare API, or the dashboard, then create an
R2 API token scoped to that bucket with Object Read & Write permission.

```bash
wrangler r2 bucket create replace-with-state-bucket
cd infrastructure
cp backend.r2.hcl.example backend.r2.hcl
```

Edit the bucket name and account-specific R2 endpoint in `backend.r2.hcl`, then
provide the R2 credentials through the S3-compatible environment variables:

```bash
export AWS_ACCESS_KEY_ID='R2 access key ID'
export AWS_SECRET_ACCESS_KEY='R2 secret access key'
tofu init -reconfigure -backend-config=backend.r2.hcl
```

The copied backend file is ignored. Credentials remain in environment variables,
not command-line backend arguments, generated plans, or repository files.

Cloudflare's documented R2 backend recipe does not include a state-locking
mechanism. Serialize production apply jobs (for example, with one GitHub Actions
concurrency group) so two writers cannot update state concurrently.

Use a new state key for this Cloudflare stack. Do not migrate the legacy
DigitalOcean state into it: that state represents resources from a different
platform and lifecycle. Archive it and decommission any remaining DigitalOcean
resources separately using the old configuration if needed.

## Create a new zone

Authenticate the provider separately from the R2 backend:

```bash
export CLOUDFLARE_API_TOKEN='scoped Cloudflare API token'
tofu plan \
  -var='enable_apex_domain=false' \
  -var='enable_www_domain=false' \
  -out=cloudflare-bootstrap.tfplan
tofu apply cloudflare-bootstrap.tfplan
```

Plan files are ignored because they can contain configuration and state data.
The bootstrap override creates the full zone and Worker identity without trying
to attach custom domains before the zone is active or the Worker has a deployed
version.

Configure the returned nameservers at the domain registrar:

```bash
tofu output registrar_name_servers
```

Cloudflare creates a full zone in `pending` status. Registrar changes are
outside this stack; wait for the zone to become `active` after nameserver
propagation before attaching Worker custom domains. A normal `tofu plan`
refreshes the status shown by `tofu output zone`.

Deploy the Angular/static-assets Worker with Wrangler
using the exact Worker name:

```bash
tofu output -raw wrangler_worker_name
# From the application workspace:
wrangler deploy --name where-my-cage-at
```

After the zone is active and the first Worker version exists, apply the normal
values to attach the apex, `www`, and any additional custom domains:

```bash
tofu plan -out=cloudflare.tfplan
tofu apply cloudflare.tfplan
```

## Import existing Cloudflare resources

If the domain was already added to Cloudflare, OpenTofu should adopt it rather
than attempt to create a duplicate. Initialize the backend, set the matching
account ID and zone name, and import the zone before the first plan:

```bash
tofu import cloudflare_zone.site '<zone_id>'
```

Import any existing Worker or custom domains as well:

```bash
tofu import cloudflare_worker.site '<account_id>/<worker_id>'
tofu import 'cloudflare_workers_custom_domain.site["example.com"]' '<account_id>/<domain_id>'
```

Repeat the custom-domain import for each configured hostname. Importing does not
weaken ownership: the resources remain fully managed by this stack after they
enter state. Run `tofu plan` and reconcile any reported drift before applying.

## References

- [Cloudflare Workers infrastructure as code](https://developers.cloudflare.com/workers/platform/infrastructure-as-code/)
- [Cloudflare Terraform provider zones](https://developers.cloudflare.com/api/terraform/resources/zones/)
- [Cloudflare Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Cloudflare Terraform provider Workers domains](https://developers.cloudflare.com/api/terraform/resources/workers/subresources/domains/)
- [Cloudflare R2 remote backend](https://developers.cloudflare.com/terraform/advanced-topics/remote-backend/)
- [OpenTofu state backends](https://opentofu.org/docs/language/state/backends/)
