const {
  BedrockRuntimeClient,
  ListFoundationModelsCommand,
} = require("@aws-sdk/client-bedrock-runtime");
require("dotenv").config();

async function checkAWSCredentials() {
  console.log("🔍 Checking AWS Credentials...\n");

  // Check environment variables
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_BEDROCK_API_KEY;
  const secretAccessKey = process.env.AWS_BEDROCK_ACCESS_KEY;

  console.log("Environment Variables:");
  console.log(`AWS_REGION: ${region ? "✅ Set" : "❌ Missing"}`);
  console.log(`AWS_BEDROCK_API_KEY: ${accessKeyId ? "✅ Set" : "❌ Missing"}`);
  console.log(
    `AWS_BEDROCK_ACCESS_KEY: ${secretAccessKey ? "✅ Set" : "❌ Missing"}\n`
  );

  if (!region || !accessKeyId || !secretAccessKey) {
    console.log("❌ Missing required environment variables!");
    console.log("Please set the following in your .env file:");
    console.log("AWS_REGION=us-east-1");
    console.log("AWS_BEDROCK_API_KEY=your_access_key");
    console.log("AWS_BEDROCK_ACCESS_KEY=your_secret_key");
    return;
  }

  try {
    // Test Bedrock client
    const bedrockClient = new BedrockRuntimeClient({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    console.log("✅ AWS Bedrock client created successfully");
    console.log(`✅ Using region: ${region}`);
    console.log("✅ Credentials appear to be valid\n");

    console.log("📋 Next steps:");
    console.log("1. Make sure your AWS account has access to Bedrock");
    console.log("2. Ensure your IAM user/role has Bedrock permissions");
    console.log("3. Check if Bedrock is available in your region");
    console.log("4. Try running your API again");
  } catch (error) {
    console.log("❌ Error creating Bedrock client:");
    console.log(error.message);
    console.log("\n📋 Troubleshooting:");
    console.log("1. Check your AWS credentials are correct");
    console.log("2. Verify your AWS account has Bedrock access");
    console.log("3. Ensure your IAM permissions include Bedrock");
    console.log("4. Check if Bedrock is available in your region");
  }
}

checkAWSCredentials().catch(console.error);
