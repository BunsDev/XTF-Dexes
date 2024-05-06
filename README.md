# Block magic Indexes


# Coingecko API

curl --request GET \
     --url https://pro-api.coingecko.com/api/v3/coins/categories \
     --header 'accept: application/json' \
     --header 'x-cg-pro-api-key: $API'



# issues

ENV-ENC Does not work because it is not with that name in the registry after looking the regiostry looks like it is at npx @chainlink/env-enc

curl --request GET \
https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc