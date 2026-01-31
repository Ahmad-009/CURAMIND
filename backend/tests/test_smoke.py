import requests

# response = requests.get('http://localhost:8000')
# print(response.json())
# print(response.status_code)
# print(response.headers)

response2 = requests.get('http://localhost:8000/custom')
print(response2.json())
print(response2.headers)