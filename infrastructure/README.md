# Infastructure for Application

DO Slugs: https://slugs.do-api.dev/

## Getting Started

You will need to have `terraform` installed to start.

Env Vars you need to ensure are set so that `terraform` can work.

```bash
TF_VAR_do_token='Digitial_Ocean_token'
TF_VAR_ssh_key_fingerprint='ssh fingerprint in DO console'
```

```bash
# downloads provider and sets up the dir
terraform init

# creates a plan based off the configuration setup
terraform plan -out droplet.tfplan

# execute the created plan and deploy
terraform apply "droplet.tfplan"

# clean up
terraform destroy
```

Then once its finished you should be able to navigate to the ip address listed in the console.

### SSH

A script is included that you can use to setup your SSH key, you can call it like:

```bash
sh ssh.sh email@email.com
```

SSH into the newly created droplet with your new SSH key

```bash
ssh root@IP_ADDRESS -i ~/.ssh/do_id_rsa.pub
```

### Certbot Info

https://www.nginx.com/blog/using-free-ssltls-certificates-from-lets-encrypt-with-nginx/

### FYIs

#### Windows

If you are trying to use powershell you will need to setup the env vars so powershell can recognize them. [More here](https://mcpmag.com/articles/2019/03/28/environment-variables-in-powershell.aspx)

### Resources

- https://cloudinit.readthedocs.io/en/latest/topics/examples.html
- https://dev.to/bitleaf_io/creating-a-digitalocean-droplet-with-terraform-part-1-of-3-1pko
- https://learn.hashicorp.com/tutorials/terraform/digitalocean-provider?in=terraform/applications
- https://linuxblog.xyz/posts/create-a-droplet-with-terraform/
- https://willschenk.com/articles/2019/terraform_with_digitalocean/
- https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs/resources/droplet
- https://grantorchard.com/dynamic-cloudinit-content-with-terraform-file-templates/
- https://learn.hashicorp.com/tutorials/terraform/cloud-init?in=terraform/provision
- https://gist.github.com/syntaqx/9dd3ff11fb3d48b032c84f3e31af9163
