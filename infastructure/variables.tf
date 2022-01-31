variable "do_token" {
  description = "DigitalOcean Api Token"
}
variable "ssh_key_fingerprint" {
  description = "Fingerprint of the public ssh key stored on DigitalOcean"
}
variable "region" {
  description = "DigitalOcean region"
  default     = "nyc3"
}
variable "droplet_image" {
  description = "DigitalOcean droplet image name"
  default     = "docker-20-04"
}
variable "droplet_size" {
  description = "Droplet size for server"
  default     = "s-1vcpu-2gb"
}
variable "ssh_public_key_path" {
  description = "Local public ssh key path"
  default     = "~/.ssh/do_id_rsa.pub"
}
variable "ssh_public_key" {
  description = "Local public ssh key"
  default     = "default"
}
