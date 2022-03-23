resource "aws_dynamodb_table" "main" {
  name           = "${var.prefix}-Score"
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "UserId"

  attribute {
    name = "UserId"
    type = "S"
  }

  /* ttl { */
  /*   attribute_name = "TimeToExist" */
  /*   enabled        = false */
  /* } */
}
