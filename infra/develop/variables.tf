variable "region" {
  type    = string
  default = "ap-northeast-1"
}
variable "tags" {
  type = map(string)
  default = {
    "Project"     = "idpool-practice"
    "Environment" = "dev"
    "Terraform"   = "true"
  }
}
