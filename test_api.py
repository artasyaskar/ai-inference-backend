#!/usr/bin/env python3
"""
Simple test script to verify API functionality
"""

import requests
import json
import time

def test_api():
    base_url = "http://127.0.0.1:8000"
    
    print("Testing AI Inference Backend API...")
    print(f"Base URL: {base_url}")
    
    # Test 1: Health check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✓ Health check passed")
            print(f"  Response: {response.json()}")
        else:
            print(f"✗ Health check failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"✗ Health check error: {e}")
        return False
    
    # Test 2: List models
    print("\n2. Testing models endpoint...")
    try:
        response = requests.get(f"{base_url}/models", timeout=5)
        if response.status_code == 200:
            print("✓ Models endpoint passed")
            models = response.json()
            print(f"  Available models: {len(models)}")
            for model in models:
                print(f"    - {model['name']}:{model['version']} ({model['type']})")
        else:
            print(f"✗ Models endpoint failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"✗ Models endpoint error: {e}")
    
    # Test 3: Simple inference (if models are loaded)
    print("\n3. Testing inference endpoint...")
    try:
        test_data = {
            "text": "This is a simple test text for summarization.",
            "model": "summarizer",
            "version": "v1"
        }
        
        response = requests.post(
            f"{base_url}/infer",
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            print("✓ Inference endpoint passed")
            result = response.json()
            print(f"  Success: {result['success']}")
            print(f"  Model used: {result['model_used']}")
            print(f"  Latency: {result['latency_ms']}ms")
            if result['success']:
                print(f"  Result: {result['result'][:100]}...")
            else:
                print(f"  Error: {result['error']}")
        else:
            print(f"✗ Inference endpoint failed: {response.status_code}")
            print(f"  Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"✗ Inference endpoint error: {e}")
    
    print("\nAPI testing completed!")

if __name__ == "__main__":
    test_api()
