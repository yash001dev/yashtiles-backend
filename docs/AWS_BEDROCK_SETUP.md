# AWS Bedrock Setup Guide

## Prerequisites

1. **AWS Account**: You need an AWS account with access to Amazon Bedrock
2. **Bedrock Access**: Your AWS account must be approved for Bedrock usage
3. **IAM Permissions**: Your IAM user/role needs Bedrock permissions

## Environment Variables

Add these to your `.env` file:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## Supported Regions

Amazon Bedrock is available in these regions:
- `us-east-1` (N. Virginia) - **Recommended**
- `us-west-2` (Oregon)
- `eu-west-1` (Ireland)
- `ap-southeast-1` (Singapore)

## IAM Permissions

Your IAM user/role needs these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:us-east-1::foundation-model/stability.stable-diffusion-xl-v1",
                "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-image-generator-v1"
            ]
        }
    ]
}
```

## Getting Bedrock Access

1. **Request Access**: Go to AWS Bedrock console
2. **Model Access**: Request access to specific models:
   - `stability.stable-diffusion-xl-v1`
   - `amazon.titan-image-generator-v1`
3. **Wait for Approval**: AWS will review and approve your request

## Testing Your Setup

Run the credential check script:

```bash
node scripts/check-aws-credentials.js
```

## Troubleshooting

### "Resolved credential object is not valid"
- Check your AWS credentials are correct
- Verify the region supports Bedrock
- Ensure your account has Bedrock access

### "Access Denied"
- Your IAM user/role lacks Bedrock permissions
- Add the required IAM permissions above

### "Model not found"
- The model ID might be incorrect
- Check if the model is available in your region
- Verify your account has access to that specific model

### "Rate limit exceeded"
- Bedrock has rate limits
- Wait a few minutes and try again

## Common Issues

1. **Wrong Region**: Use `us-east-1` for best compatibility
2. **No Bedrock Access**: Request access in AWS Bedrock console
3. **Missing IAM Permissions**: Add Bedrock permissions to your IAM role
4. **Model Not Available**: Some models may not be available in all regions

## Quick Fix

If you're getting credential errors, try:

1. Change your region to `us-east-1`:
   ```env
   AWS_REGION=us-east-1
   ```

2. Verify your credentials work:
   ```bash
   node scripts/check-aws-credentials.js
   ```

3. Check Bedrock access in AWS console 