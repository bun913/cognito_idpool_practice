variable "prefix" {
  type        = string
  description = "Default Prefix of Resource Name"
}
variable "table_arn" {
  type        = string
  description = "DynamoDB Table ARN"
}
variable "tags" {
  type = object({
    Environment = string
    Project     = string
    Terraform   = string
  })
}
