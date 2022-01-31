data "template_file" "userdata" {
  template = file("${path.module}/app.yaml")

  vars = {
    pub_key = var.ssh_public_key != "default" ? var.ssh_public_key : file(var.ssh_public_key_path)
  }
}

# # Setup a DO volume
# resource "digitalocean_volume" "dills_volume_1" {
#   region                  = "nyc3"
#   name                    = "wmca-volume-1"
#   size                    = 5
#   initial_filesystem_type = "ext4"
#   description             = "wmca volume 1"
# }

# Setup a DO droplet
resource "digitalocean_droplet" "wmca_server_1" {
  image  = var.droplet_image
  name   = "wmca-server-1"
  region = var.region
  size   = var.droplet_size
  ssh_keys = [
    var.ssh_key_fingerprint
  ]
  user_data = data.template_file.userdata.rendered
}

# # Connect the volume to the droplet
# resource "digitalocean_volume_attachment" "dills_volume_1" {
#   droplet_id = digitalocean_droplet.dills_server_1.id
#   volume_id  = digitalocean_volume.dills_volume_1.id
# }

# Output the public IP address of the new droplet
output "public_ip_server" {
  value = digitalocean_droplet.wmca_server_1.ipv4_address
}