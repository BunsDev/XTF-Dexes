import json
import requests
import time

# Function to call the API and save the result
def fetch_and_save_data(entry):
    base_url = "https://api.coingecko.com/api/v3/coins/markets"
    params = {
        'vs_currency': 'usd',
        'order': 'market_cap_desc',
        'category': entry['id']
    }
    response = requests.get(base_url, params=params)
    # WAIT 25 SECONDS
    time.sleep(25)

    if response.status_code == 200:
        file_name = "categories/" + entry['id'] + ".json"
        with open(file_name, 'w') as file:
            json.dump(response.json(), file, indent=4)
        print("Data saved to" + file_name)
    else:
        print("Failed to fetch data for category:" + entry['id']
              + " with status code:" + str(response.status_code))



with open('category.json', 'r') as file:
    data = json.load(file)

# Loop through each entry in the array and fetch data
for entry in data:
    fetch_and_save_data(entry)
