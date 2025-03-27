import requests

url = "http://localhost:8000/extract-structured-resume/"
payload = {
    "resume_id": "67ddec795be8f80d1458c770",
    "language": "de"
}

response = requests.post(url, json=payload)
print(response.json())