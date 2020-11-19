terraform {
  required_version = ">= 0.12"
}

provider "aws" {
  version = "~> 2.70"
  region  = var.aws_region
  profile = var.aws_profile
}

resource "aws_s3_bucket" "robin" {
  bucket = "maji-robin-test"
  force_destroy = true
}

resource "aws_sns_topic" "robin" {
  name = "maji-robin-test"
}

data "archive_file" "lambda_zip" {
    type          = "zip"
    source_dir = "function"
    output_path   = "lambda_function.zip"
}

resource "aws_lambda_function" "robin" {
  filename         = "lambda_function.zip"
  function_name    = "robin"
  role             = aws_iam_role.robin_lambda.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs10.x"
}

resource "aws_lambda_permission" "robin" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.robin.arn
  principal = "s3.amazonaws.com"
  source_arn = aws_s3_bucket.robin.arn
}

resource "aws_iam_role" "robin_lambda" {
  name = "robin_lambda"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "robin" {
  name = "robin_lambda_sns"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "sns:*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "robin" {
  role       = aws_iam_role.robin_lambda.name
  policy_arn = aws_iam_policy.robin.arn
}

resource "aws_iam_policy" "robin_s3" {
  name = "robin_lambda_s3"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "robin_s3" {
  role       = aws_iam_role.robin_lambda.name
  policy_arn = aws_iam_policy.robin_s3.arn
}

resource "aws_iam_policy" "robin_dynamo" {
  name = "robin_lambda_dynamo"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "dynamodb:*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "robin_dynamo" {
  role       = aws_iam_role.robin_lambda.name
  policy_arn = aws_iam_policy.robin_dynamo.arn
}

resource "aws_s3_bucket_notification" "robin" {
  bucket = aws_s3_bucket.robin.id
  lambda_function {
    lambda_function_arn = aws_lambda_function.robin.arn
    events              = ["s3:ObjectCreated:Put"]
  }
}

resource "aws_dynamodb_table" "robin" {
  name           = "robin"
  billing_mode   = "PAY_PER_REQUEST"
  read_capacity  = 20
  write_capacity = 20
  hash_key       = "address"

  attribute {
    name = "address"
    type = "S"
  }
}
