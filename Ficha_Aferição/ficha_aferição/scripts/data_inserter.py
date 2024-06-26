# Author: Daniel Pereira
# Date: 2021-04-07
# Description: This program inserts data into the database through the API

import requests
import json
import os
import time

URL = "http://localhost:3000/api"

FILES = [
    "../datasets/dataset-extra1.json",
    "../datasets/dataset-extra2.json",
    "../datasets/dataset-extra3.json",
]

headers = {
    'Content-Type': 'application/json',
}

def addPessoa(data):
    endpoint = URL + "/pessoas"
    response = requests.post(endpoint, json=data, headers=headers)
    print(response.text)

def main():
    for file in FILES:
        script_dir = os.path.dirname(__file__)
        path = os.path.join(script_dir, file)
        with open(path, "r") as f:
            data = json.load(f)
            for pessoa in data["pessoas"]:
                addPessoa(pessoa)

if __name__ == "__main__":
    main()
