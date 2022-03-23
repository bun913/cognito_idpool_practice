resource "aws_iam_role" "authenticated" {
  name = "${var.prefix}-cognito-authenticated"

  assume_role_policy = templatefile("${path.module}/iam/assume_policy.json", {
    IDPOOL_NAME = aws_cognito_identity_pool.main.id
  })
}

resource "aws_iam_role_policy" "authenticated" {
  name = "authenticated_policy"
  role = aws_iam_role.authenticated.id

  policy = templatefile("${path.module}/iam/authenticated_policy.json", {
    DYNAMO_TABLE_ARN = var.table_arn
  })
}

resource "aws_iam_role" "unauthenticated" {
  name = "${var.prefix}-cognito-unauthenticated"

  assume_role_policy = templatefile("${path.module}/iam/assume_policy_unauth.json", {
    IDPOOL_NAME = aws_cognito_identity_pool.main.id
  })
}

resource "aws_iam_role_policy" "unauthenticated" {
  name = "authenticated_policy"
  role = aws_iam_role.unauthenticated.id

  policy = templatefile("${path.module}/iam/unauthenticated_policy.json", {})
}

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id

  roles = {
    "authenticated"   = aws_iam_role.authenticated.arn
    "unauthenticated" = aws_iam_role.unauthenticated.arn
  }
}
