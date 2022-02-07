#!/usr/bin/env bash

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
