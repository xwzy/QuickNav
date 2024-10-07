import os
import sqlite3
import requests
import sys


# Insert test data
def insert_test_data():
    base_url = "http://localhost:8080/api"
    
    # Add categories
    categories = [
        {"name": "Social Media"},
        {"name": "News"},
        {"name": "Programming"},
        {"name": "Entertainment"},
        {"name": "Education"},
    ]
    
    for category in categories:
        response = requests.post(f"{base_url}/categories", json=category)
        if response.status_code != 201:
            print(f"Failed to add category {category['name']}: {response.text}")
            sys.exit(1)
        else:
            print(f"Added category: {category['name']}")
    
    # Get updated categories to use correct IDs
    response = requests.get(f"{base_url}/categories")
    if response.status_code != 200:
        print("Failed to get categories")
        sys.exit(1)
    categories = response.json()
    category_map = {cat['name']: cat['id'] for cat in categories}
    
    # Add sites
    sites = [
        {"name": "Facebook", "url": "https://facebook.com", "category_id": category_map["Social Media"]},
        {"name": "Twitter", "url": "https://twitter.com", "category_id": category_map["Social Media"]},
        {"name": "Instagram", "url": "https://instagram.com", "category_id": category_map["Social Media"]},
        {"name": "CNN", "url": "https://cnn.com", "category_id": category_map["News"]},
        {"name": "BBC", "url": "https://bbc.com", "category_id": category_map["News"]},
        {"name": "The New York Times", "url": "https://nytimes.com", "category_id": category_map["News"]},
        {"name": "GitHub", "url": "https://github.com", "category_id": category_map["Programming"]},
        {"name": "Stack Overflow", "url": "https://stackoverflow.com", "category_id": category_map["Programming"]},
        {"name": "LeetCode", "url": "https://leetcode.com", "category_id": category_map["Programming"]},
        {"name": "Netflix", "url": "https://netflix.com", "category_id": category_map["Entertainment"]},
        {"name": "YouTube", "url": "https://youtube.com", "category_id": category_map["Entertainment"]},
        {"name": "Spotify", "url": "https://spotify.com", "category_id": category_map["Entertainment"]},
        {"name": "Coursera", "url": "https://coursera.org", "category_id": category_map["Education"]},
        {"name": "edX", "url": "https://edx.org", "category_id": category_map["Education"]},
        {"name": "Khan Academy", "url": "https://khanacademy.org", "category_id": category_map["Education"]},
    ]
    
    for site in sites:
        response = requests.post(f"{base_url}/sites", json=site)
        if response.status_code != 201:
            print(f"Failed to add site {site['name']}: {response.text}")
            sys.exit(1)
        else:
            print(f"Added site: {site['name']}")

    # Test getting site title
    response = requests.get(f"{base_url}/sites/title?id=1")
    if response.status_code != 200:
        print(f"Failed to get site title. Status code: {response.status_code}")
        print(f"Response text: {response.text}")
    else:
        try:
            title = response.json().get('title')
            if title:
                print(f"Got site title: {title}")
            else:
                print("Site title not found in response")
        except requests.exceptions.JSONDecodeError:
            print("Failed to decode JSON response")
            print(f"Response text: {response.text}")

if __name__ == "__main__":
    insert_test_data()
    print("Test data insertion completed.")

