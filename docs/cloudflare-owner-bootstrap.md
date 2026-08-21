# Cloudflare owner bootstrap and handoff

This checklist covers the one-time account work that must be completed by the
Cloudflare and domain owner before the repository can be bootstrapped and
deployed. It deliberately separates owner-managed credentials and registrar
changes from resources managed as code.

The target production contract is:

| Setting | Value |
| --- | --- |
| Cloudflare zone | `wheremycageat.com` |
| Worker | `where-my-cage-at` |
| Production hostnames | `wheremycageat.com`, `www.wheremycageat.com` |
| OpenTofu state bucket | `where-my-cage-at-tofu-state` |
| OpenTofu state object | `where-my-cage-at/production.tfstate` |
| GitHub environment | `production` |
| Production origin | `https://wheremycageat.com` |

## Current state

As of August 21, 2026, the repository contains the OpenTofu stack, Wrangler
configuration, and deployment workflow, but it is not connected to a
Cloudflare account. The repository has no Cloudflare variables or secrets and
no GitHub `production` environment. The domain's authoritative nameservers are
still DigitalOcean nameservers.

No live Cloudflare deployment has been attempted. Keep scheduled deployments
disabled until the bootstrap sequence in this document is complete.

## What you need to do now

### 1. Prepare the Cloudflare account

- Sign in to the Cloudflare account that should permanently own this site.
- Confirm that you are a Super Administrator if you want to create the
  recommended account-owned API token. A user API token can be used otherwise.
- Copy the 32-character **Account ID**. In the dashboard it is available from
  the account home page or the Workers & Pages overview.
- Enable R2 for the account if it has not been enabled before. Cloudflare may
  require completing the R2 purchase/onboarding flow even when usage remains
  within the free allowance.

Do **not** add `wheremycageat.com` through the dashboard. OpenTofu creates and
owns the full zone so that its lifecycle remains in state.

### 2. Create the R2 state bucket and credentials

In **Storage & databases > R2 > Overview**:

1. Create a private bucket named `where-my-cage-at-tofu-state`.
2. Open **Manage API Tokens** and create an R2 token named
   `where-my-cage-at-opentofu-state`.
3. Grant **Object Read & Write** access, scoped only to
   `where-my-cage-at-tofu-state`.
4. Copy the **Access Key ID** and **Secret Access Key** when shown. The secret
   is shown once.
5. Record the S3 endpoint as
   `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.

Store both credentials in a password manager. These are S3-compatible R2
credentials used only by the OpenTofu backend. They are not the Cloudflare API
token and should not be added to the application deployment workflow.

### 3. Create the deployment and infrastructure API token

Prefer an account-owned token because it is a durable CI/CD service credential
instead of being tied to one user's membership. In **Manage Account > Account
API Tokens**, create a custom token named `where-my-cage-at-production` with:

| Permission group | Permission | Level | Resource scope |
| --- | --- | --- | --- |
| Zone | Zone | Edit | All zones in the selected account |
| Account | Workers Scripts | Edit | The selected account |

The zone permission must initially cover all zones in this account because the
`wheremycageat.com` zone does not exist yet and therefore cannot be selected as
an individual resource. Do not use the Global API Key.

If account-owned tokens are unavailable to you, create a user token from **My
Profile > API Tokens** with the same permissions and resource scopes.

Copy the token secret when it is shown and store it in a password manager. Do
not paste it into chat, a shell history command, an HCL file, or Git.

### 4. Prepare the GitHub production environment

In the repository, open **Settings > Environments** and create an environment
named `production`. Configure the following environment secrets:

| GitHub name | Value | Notes |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | Token from step 3 | Secret |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | Identifier, stored as a secret because that is the workflow contract |
| `TMDB_KEY` | Production TMDB API key | Existing application secret |

Add this environment variable:

| GitHub name | Value |
| --- | --- |
| `WMCA_PRODUCTION_ORIGIN` | `https://wheremycageat.com` |

A required reviewer is recommended for production. If deployment branches are
restricted, select `master`; invoke manual production deployments from
`master` after the deployment PR is merged.

At the repository level, create the Actions variable
`CLOUDFLARE_DEPLOY_ENABLED` with value `false`. This leaves scheduled refreshes
inert during bootstrap. It will be changed to `true` only after the first
manual deployment and hosted smoke test succeed.

### 5. Confirm registrar access and DNS safety

Confirm that you can change nameservers for `wheremycageat.com` at its current
registrar. Do not change them yet: Cloudflare will not assign the replacement
nameservers until OpenTofu creates the zone.

Before the later nameserver change:

- check whether DNSSEC is enabled at the registrar and disable it before
  replacing nameservers;
- inventory any DNS records used for email or other services, including MX,
  TXT, CAA, and non-site subdomains;
- tell the handoff owner about any record that must survive the move.

The application is currently offline, but a nameserver change affects the
entire domain, not only the website. Unrelated email or verification records
must be represented in Cloudflare before delegation changes.

## Stop here and hand off

After the five sections above are complete, send only this non-secret summary:

```text
Cloudflare account ID: <32-character account ID>
Cloudflare account name: <display name>
R2 state bucket: where-my-cage-at-tofu-state
R2 credentials saved securely: yes
Production API token saved securely: yes
GitHub production environment configured: yes
Registrar: <registrar name>
Registrar access confirmed: yes
DNSSEC currently enabled: yes/no
Non-website DNS records that must be preserved: <names/types only, or none>
```

Do not include either Cloudflare token, the R2 Secret Access Key, or the TMDB
key in the handoff message. Credential use should happen through the password
manager, an approved local environment, or GitHub environment secrets.

## What the repository automation owns

Do not manually create any of the following in Cloudflare:

- the `wheremycageat.com` zone;
- the `where-my-cage-at` Worker;
- a Cloudflare Pages project;
- Worker routes or custom domains;
- apex or `www` A, AAAA, or CNAME records;
- TLS certificates for the application hostnames.

OpenTofu owns the zone, stable Worker identity and settings, and Worker custom
domains. Cloudflare creates the corresponding custom-domain DNS and TLS.
Wrangler owns application versions and static assets. Manual copies would cause
conflicts or infrastructure drift.

Do not delete the old DigitalOcean resources or repository secrets during this
bootstrap. They can be retired separately after Cloudflare has been verified.

## What happens after handoff

1. Merge the Cloudflare deployment pull request.
2. Configure ignored local OpenTofu values and the R2 backend using the account
   ID and securely supplied credentials.
3. Apply OpenTofu with apex and `www` disabled. This creates the zone and Worker
   identity without attaching domains prematurely.
4. Return Cloudflare's assigned nameservers to the owner.
5. The owner disables registrar DNSSEC if necessary and replaces the
   DigitalOcean nameservers with the assigned Cloudflare nameservers.
6. Wait for the Cloudflare zone to become `active`.
7. Manually run **Refresh and deploy Cloudflare** from `master`, supplying the
   full merged commit SHA and setting `run_hosted_smoke` to `false`.
8. Apply OpenTofu normally to attach apex and `www` as Worker custom domains.
9. Verify the application, SPA fallback, catalogue manifest, DNS, and TLS.
10. Run the deployment workflow once with hosted smoke enabled.
11. Set `CLOUDFLARE_DEPLOY_ENABLED` to `true` to enable the twice-daily refresh
    and deploy schedule.
12. Retire obsolete DigitalOcean resources and credentials in a separate,
    explicitly reviewed cleanup.

R2's S3-compatible OpenTofu backend does not provide state locking in this
configuration. Production OpenTofu operations must be serialized.

## Official references

- [Create a Cloudflare API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Cloudflare account-owned API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/account-owned-tokens/)
- [Find Cloudflare account and zone IDs](https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/)
- [Create R2 S3 credentials](https://developers.cloudflare.com/r2/get-started/s3/)
- [Cloudflare full DNS setup and nameserver change](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)
- [GitHub deployment environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)

For implementation details and operator commands, see
[`infrastructure/README.md`](../infrastructure/README.md).
