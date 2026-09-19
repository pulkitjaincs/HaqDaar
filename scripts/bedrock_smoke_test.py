#!/usr/bin/env python3
"""Smoke test for Amazon Bedrock access.

Usage:
    BEDROCK_MODEL_ID=<model-id> AWS_REGION=<region> python scripts/bedrock_smoke_test.py

Records the working modelId/region in .env.example if successful.
"""
import os
import json
import boto3

def main():
    model_id = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")
    region = os.environ.get("AWS_REGION", "us-east-1")

    print(f"Testing Bedrock access...")
    print(f"  Model: {model_id}")
    print(f"  Region: {region}")

    try:
        client = boto3.client("bedrock-runtime", region_name=region)
        response = client.invoke_model(
            modelId=model_id,
            contentType="application/json",
            accept="application/json",
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 100,
                "messages": [{"role": "user", "content": "Say hello in Hindi, one sentence."}]
            })
        )
        result = json.loads(response["body"].read())
        reply = result.get("content", [{}])[0].get("text", "")
        print(f"\n✅ Success! Model replied: {reply}")

        with open(".env.example", "w") as f:
            f.write(f"BEDROCK_MODEL_ID={model_id}\n")
            f.write(f"AWS_REGION={region}\n")
            f.write("ELIGIBILITY_ENGINE=json\n")
            f.write("MOCK_LLM=0\n")
            f.write("SESSIONS_TABLE=haqdaar-sessions\n")
        print("Wrote .env.example")

    except Exception as e:
        print(f"\n❌ Bedrock access failed: {e}")
        print("Ensure your AWS credentials are configured and you have Bedrock model access enabled.")
        raise SystemExit(1)

if __name__ == "__main__":
    main()
