#!/usr/bin/env bash

#
# Copyright 2021 The PartChain Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

echo "[INFO] Request Assume role in target account ${ACCOUNT_ID}"

echo "setting up aws profile for ${ENVIRONMENT}"
aws sts assume-role --role-arn arn:aws:iam::${ACCOUNT_ID}:role/${CROSS_ACC_ROLE} --role-session-name "deployment" > /tmp/role
export AWS_ACCESS_KEY_ID=$(cat /tmp/role|jq -r '.Credentials.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(cat /tmp/role|jq -r '.Credentials.SecretAccessKey')
export AWS_SESSION_TOKEN=$(cat /tmp/role|jq -r '.Credentials.SessionToken')
export AWS_REGION="eu-west-1"

echo "[INFO] Scan on push"
aws ecr start-image-scan --repository-name "${ECR_REPO_NAME}" --image-id imageTag="${SHORT_COMMIT_ID}"

echo "[INFO] Waiting for completing Image Scan"
aws ecr wait image-scan-complete --repository-name "${ECR_REPO_NAME}" --image-id imageTag="${SHORT_COMMIT_ID}"

echo "[INFO] Retrieve scan findings"
mkdir reports
aws ecr describe-image-scan-findings --repository-name "${ECR_REPO_NAME}" --image-id imageTag="${SHORT_COMMIT_ID}" > reports/scan_results.json

echo "We are here ${PWD}"
ls -ls reports/

echo "[INFO] Produce xml reports"
./helpers/convert4report.py
retcode=$?

if [[ "${retcode}" != 0 ]] && [[ "${DELETE_ON_FAILURE}" == "Yes" ]] ; then
  echo "Removing tag ${SHORT_COMMIT_ID} from image ${ECR_REPO_NAME}"
  aws ecr batch-delete-image --repository-name "${ECR_REPO_NAME}" --image-ids imageTag="${SHORT_COMMIT_ID}"
elif [[ "${retcode}" != 0 ]] && [[ "${DELETE_ON_FAILURE}" == "No" ]] ; then
  echo "Docker image is kept but not deployed."
fi

exit $retcode
