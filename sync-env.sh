#!/bin/bash
#
# Sync missing .env KEYS into secret manager
# 
set -euo pipefail

# Determine what store to use
if [ -z "${SM_STORE+x}" ] 
  then
    echo 'Please set SM_STORE env variable to point to correct secret manager reference!'
    exit 255
fi
echo 'Using store '$SM_STORE
echo

# Get .env keys and values from SM, if .env does not exist
if [ ! -f ".env" ]
  then
    echo "The file .env cannot be found. Synchronisation aborted!"
    exit 255
fi

# Get current version of JSON from SM store
aws secretsmanager get-secret-value --secret-id arn:aws:secretsmanager:ap-southeast-2:101962223666:secret:$SM_STORE --query SecretString --output text | jq -r 'to_entries|map("\(.key)=\(.value|tostring)")|.[]' > wsa_keys.current

# Add missing key/value pairs to current version 
KEYS_ADDED=0
for MISSING_KEY in $(cat wsa_keys.missing); do 
  if grep -Rq $MISSING_KEY .env
  then
    echo "Adding key: "$MISSING_KEY
    grep -R $MISSING_KEY .env >> wsa_keys.current
    KEYS_ADDED=1
  else
    echo "Key "$MISSING_KEY" not defined in .env. Synchronisation aborted!"
    exit 255
  fi
done

if [ "${KEYS_ADDED}" == "1" ]
  then
    # Convert key/value pairs to JSON 
    cat .env | sort | jq -n -R -f sync-env.jq > wsa_keys_new.json 

    # Update Secret Manager with new JSON file
    aws secretsmanager put-secret-value --secret-id arn:aws:secretsmanager:ap-southeast-2:101962223666:secret:$SM_STORE --secret-string file://wsa_keys_new.json
  else
    echo "No new keys were added!"
fi

# Clean up
rm -f wsa_keys.current
rm -f wsa_keys_new.json