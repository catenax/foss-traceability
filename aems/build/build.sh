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

# Build Docker images for Webapp
#/bin/bash

echo "Building image for: ${TARGET_IMAGE_NAME}:${ENVIRONMENT}"

eval `./helpers/get_docker_secret.py | grep export`


if [[ "${ENVIRONMENT}" == "dev" ]] || [[ "${ENVIRONMENT}" == "int" ]] || [[ "${ENVIRONMENT}" == "prod" ]] || [[ "$ENVIRONMENT" == "cx-prod" ]]; then

    # Build as "latest" & with commit id
     echo "if repo = ${NPM_CORE_REPO_NAME} account  = ${ACCOUNT_ID} domain = ${NPM_DOMAIN} region = ${NPM_REPOSITORY_REGION}  "
     aws codeartifact login --tool npm --repository ${NPM_CORE_REPO_NAME} --domain ${NPM_DOMAIN} --domain-owner ${ACCOUNT_ID}  --region ${NPM_REPOSITORY_REGION}
 
    docker login --password ${DOCKER_SECRET} --username partchain
    docker build -t ${TARGET_IMAGE_NAME}:${ENVIRONMENT} -t ${TARGET_IMAGE_NAME}:${SHORT_COMMIT_ID} -f ./build/Dockerfile . 

    aws --region eu-west-1 ecr get-login-password \
        | docker login \
            --password-stdin \
            --username AWS \
            "${TARGET_IMAGE_NAME}"

    docker push ${TARGET_IMAGE_NAME}:${ENVIRONMENT}

    docker push ${TARGET_IMAGE_NAME}:${SHORT_COMMIT_ID}

else

    # Don't build feature as latest - doesn't make sense
    echo "if repo = ${NPM_CORE_REPO_NAME} account  = ${ACCOUNT_ID} domain = ${NPM_DOMAIN} region = ${NPM_REPOSITORY_REGION}  "
    aws codeartifact login --tool npm --repository ${NPM_CORE_REPO_NAME} --domain ${NPM_DOMAIN} --domain-owner ${ACCOUNT_ID}  --region ${NPM_REPOSITORY_REGION}
 
    docker login --password ${DOCKER_SECRET} --username partchain
    docker build -t ${TARGET_IMAGE_NAME}:${SHORT_COMMIT_ID} -f ./build/Dockerfile . 

    aws --region eu-west-1 ecr get-login-password \
        | docker login \
            --password-stdin \
            --username AWS \
            "${TARGET_IMAGE_NAME}"

    docker push ${TARGET_IMAGE_NAME}:${SHORT_COMMIT_ID}

fi

