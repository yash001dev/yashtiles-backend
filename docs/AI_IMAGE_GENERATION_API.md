# AI Image Generation API

This API provides image generation capabilities using AWS Bedrock models.

## Endpoint

### Generate Image
- **URL**: `POST /ai/generate-image`
- **Description**: Generate a single image using AI models
- **Authentication**: None required

## Request Body

```json
{
  "prompt": "A beautiful sunset over mountains with vibrant colors",
  "negativePrompt": "blurry, low quality, distorted",
  "model": "amazon.titan-image-generator-v1",
  "style": "photographic",
  "width": 1024,
  "height": 1024,
  "guidanceScale": 7.5,
  "steps": 30
}
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | - | Text description of the image to generate |
| `negativePrompt` | string | No | - | Text describing what to avoid in the image |
| `model` | string | No | `amazon.titan-image-generator-v1` | AI model to use |
| `style` | string | No | - | Artistic style to apply |
| `width` | number | No | 1024 | Image width (512-1024) |
| `height` | number | No | 1024 | Image height (512-1024) |
| `guidanceScale` | number | No | 7.5 | Guidance scale (1-20) |
| `steps` | number | No | 30 | Number of inference steps (10-50) |

### Available Models
- `stability.stable-diffusion-xl-v1` - Stable Diffusion XL
- `stability.stable-diffusion-xl-v1-1024x1024` - Stable Diffusion XL (1024x1024)
- `amazon.titan-image-generator-v1` - Amazon Titan Image Generator

### Available Styles
- `photographic` - Photographic style
- `digital-art` - Digital art style
- `cinematic` - Cinematic style
- `anime` - Anime style
- `cartoon` - Cartoon style
- `fantasy` - Fantasy style
- `neon-punk` - Neon punk style
- `isometric` - Isometric style
- `low-poly` - Low poly style
- `origami` - Origami style
- `modeling` - Modeling style

## Response

```json
{
  "success": true,
  "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "generationTime": 15000
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether the generation was successful |
| `imageData` | string | Base64 encoded image data with data URL prefix |
| `generationTime` | number | Generation time in milliseconds |

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Bad request - invalid parameters",
  "error": "Bad Request"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Image generation failed: [error details]",
  "error": "Internal Server Error"
}
```

## Environment Variables Required

Make sure these environment variables are set in your `.env` file:

```
AWS_REGION=us-east-1
AWS_BEDROCK_API_KEY=your_access_key
AWS_BEDROCK_ACCESS_KEY=your_secret_key
```

## Testing

You can test the API using the provided test page:
- Navigate to `http://localhost:3000/ai-image-test.html`
- Fill in the form and click "Generate Image"

## Example Usage

### cURL
```bash
curl -X POST http://localhost:3000/ai/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A majestic dragon flying over a medieval castle",
    "style": "fantasy",
    "width": 1024,
    "height": 1024
  }'
```

### JavaScript
```javascript
const response = await fetch('/ai/generate-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'A beautiful sunset over mountains',
    style: 'photographic',
    width: 1024,
    height: 1024
  })
});

const data = await response.json();
if (data.success) {
  // Display the image
  const img = document.createElement('img');
  img.src = data.imageData;
  document.body.appendChild(img);
}
```

## Notes

- The API generates exactly 1 image per request
- No history or database storage is performed
- Images are returned as base64 data URLs
- Generation time varies based on model and parameters
- Make sure your AWS credentials have access to Bedrock services 