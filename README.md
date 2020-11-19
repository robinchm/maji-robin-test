# Maji Test Project

## Prerequisite

* terraform >= 0.12
* aws-cli with valid aws credentials
* node.js >= 10.0

## Compile

```sh
cd function
npm install
```

## Usage

Update correct aws profile info in `variable.tf`,
then run:

```sh
terraform apply
aws s3 cp it/valid.csv s3://maji-robin-test/
aws s3 cp it/invalid.csv s3://maji-robin-test/
```

To receive notification for failed csvs,
subscribe to SNS topic named `maji-robin-test`.

To destroy run:
```sh
terraform destroy
```

## Unit test

```sh
cd function/test
node test.js
```

## Integration test

Update correct aws profile info in `variable.tf`,
then run:

```sh
it/test.sh
```
