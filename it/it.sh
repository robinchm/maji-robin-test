#!/bin/bash

cd ..
terraform apply -auto-approve

cd -
aws s3 cp ./it/valid.csv s3://maji-robin-test/
aws s3 cp ./it/invalid.csv s3://maji-robin-test/

cd ..
terraform destroy -auto-approve
