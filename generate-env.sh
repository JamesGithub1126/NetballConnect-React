#!/bin/bash
#
# Check for any new .env KEYS in code 
# 
set -euo pipefail

# Determine what store to use
if [ -z "${SM_STORE_ARN+x}" ] 
  then
    echo 'SM_STORE_ARN env variable not defined, setting default store!'
    SM_STORE_ARN=arn:::unknown
fi
echo 'Using store '$SM_STORE_ARN
echo

# Get .env keys defined in code branch
grep -hiro "process\.env\.[0-9A-Z_]*" --include \*.ts --include \*.jsx --exclude-dir node_modules ./* | sort | uniq | sed 's/process.env.//' > .env.wsa_keys.used
grep -hiro "REACT_APP_.[0-9A-Z_]*" --include \*.html --include \*.jsx --exclude-dir node_modules ./* | sort | uniq >> .env.wsa_keys.used
## Final sort
cat .env.wsa_keys.used | sort | uniq > wsa_keys.code && rm .env.wsa_keys.used

# Get .env keys and values from SM, however only if .env does not exist/
# This avoids an existing .env file, with custom values, 
# to be delete automatically.
if [ ! -f ".env" ]
  then
    aws secretsmanager get-secret-value --secret-id $SM_STORE_ARN --query SecretString --output text | jq -r 'to_entries|map("\(.key)=\(.value|tostring)")|.[]' | sed 's/DEP_ENV=.*/DEP_ENV=local/g' > .env
  else  
    echo 'The .env already exists !! If you want to reload .env, please delete existing .env file manually!'
fi

# Check if all keys are defined in SM
KEYS_FOUND=1
echo -n > wsa_keys.missing
for KEY in $(cat wsa_keys.code); do
  if grep -Rq $KEY .env
  then
    : # echo 'Key found: '$KEY
  else
    echo "$KEY" >> wsa_keys.missing
    KEYS_FOUND=0
  fi
done

if [ "${KEYS_FOUND}" == "0" ]  
  then
    echo "Missing keys:"
    for MISSING_KEY in $(cat wsa_keys.missing); do echo "- $MISSING_KEY"; done
    echo 
    echo "Please append the above key(s) including its value to the bottom of the .env file!"
    echo 
    exit 255
  else
    echo 'All keys found in code are present in .env'
    echo
fi
