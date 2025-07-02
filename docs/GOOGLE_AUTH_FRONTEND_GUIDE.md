# Google Authentication Frontend Implementation Guide

This guide explains how to implement Google Sign-In on the frontend to work with your NestJS backend.

## Backend Endpoints Available

Your backend provides these Google authentication endpoints:

1. **OAuth Flow (Redirect Method)**
   - `GET /api/v1/auth/google` - Initiates Google OAuth
   - `GET /api/v1/auth/google/callback` - Handles OAuth callback

2. **Token-based Login (Direct Method)**
   - `POST /api/v1/auth/google/login` - Login with Google access token

## Frontend Implementation Options

### Option 1: OAuth Redirect Flow (Recommended for web apps)

This is the traditional OAuth flow where users are redirected to Google's sign-in page.

#### Step 1: Create Sign-In Button
```html
<button onclick="signInWithGoogle()" class="google-signin-btn">
  <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google">
  Sign in with Google
</button>
```

#### Step 2: JavaScript Implementation
```javascript
function signInWithGoogle() {
  // Redirect to your backend's Google OAuth endpoint
  window.location.href = 'http://localhost:3000/api/v1/auth/google';
}

// Handle the callback (if redirected back to your frontend)
function handleGoogleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // Store the access token
    localStorage.setItem('accessToken', token);
    
    // Redirect to dashboard or home page
    window.location.href = '/dashboard';
  }
}

// Call this on your callback page
if (window.location.pathname.includes('/auth/google/success')) {
  handleGoogleCallback();
}
```

### Option 2: Google Sign-In JavaScript Library (Recommended for SPAs)

This method uses Google's JavaScript library to get tokens directly and send them to your backend.

#### Step 1: Include Google Sign-In Library
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

#### Step 2: Initialize Google Sign-In
```javascript
window.onload = function() {
  google.accounts.id.initialize({
    client_id: '829564712055-nv247pdurodv3atd4jv24rsaom8qsscm.apps.googleusercontent.com',
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById('google-signin-button'),
    { 
      theme: 'outline', 
      size: 'large',
      width: 250
    }
  );
};

async function handleCredentialResponse(response) {
  try {
    // Send the credential to your backend
    const result = await fetch('http://localhost:3000/api/v1/auth/google/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({
        credential: response.credential
      })
    });

    const data = await result.json();
    
    if (data.accessToken) {
      // Store access token
      localStorage.setItem('accessToken', data.accessToken);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Google sign-in failed:', error);
  }
}
```

#### Step 3: HTML Structure
```html
<div id="google-signin-button"></div>
```

## React Implementation

### Using Google OAuth Library

#### Step 1: Install Dependencies
```bash
npm install @google-oauth/react
```

#### Step 2: React Component
```jsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

function GoogleSignIn() {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/google/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          credential: credentialResponse.credential
        })
      });

      const data = await response.json();
      
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        // Redirect or update state
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  const handleGoogleError = () => {
    console.error('Google sign-in failed');
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      useOneTap={true}
    />
  );
}

export default GoogleSignIn;
```

#### Step 3: App.js Setup
```jsx
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleSignIn from './GoogleSignIn';

function App() {
  return (
    <GoogleOAuthProvider clientId="829564712055-nv247pdurodv3atd4jv24rsaom8qsscm.apps.googleusercontent.com">
      <div className="App">
        <GoogleSignIn />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
```

## Vue.js Implementation

#### Step 1: Install Dependencies
```bash
npm install vue3-google-login
```

#### Step 2: Vue Component
```vue
<template>
  <div>
    <GoogleLogin 
      :client-id="googleClientId"
      @success="handleGoogleSuccess"
      @error="handleGoogleError"
    />
  </div>
</template>

<script>
import { GoogleLogin } from 'vue3-google-login';

export default {
  components: {
    GoogleLogin
  },
  data() {
    return {
      googleClientId: '829564712055-nv247pdurodv3atd4jv24rsaom8qsscm.apps.googleusercontent.com'
    };
  },
  methods: {
    async handleGoogleSuccess(response) {
      try {
        const result = await fetch('http://localhost:3000/api/v1/auth/google/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            credential: response.credential
          })
        });

        const data = await result.json();
        
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          this.$router.push('/dashboard');
        }
      } catch (error) {
        console.error('Google sign-in failed:', error);
      }
    },
    handleGoogleError() {
      console.error('Google sign-in failed');
    }
  }
};
</script>
```

## Backend Update Required

Your current backend expects a different format. You need to update the `GoogleLoginDto` to handle the credential token:

```typescript
// Update your GoogleLoginDto
export class GoogleLoginDto {
  @ApiProperty({ description: 'Google credential token' })
  @IsString()
  credential?: string;

  @ApiProperty({ description: 'User email from Google' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'User first name from Google' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'User last name from Google' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'Google user ID' })
  @IsString()
  @IsOptional()
  googleId?: string;

  @ApiProperty({ description: 'User avatar URL from Google' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ description: 'Google access token' })
  @IsString()
  @IsOptional()
  accessToken?: string;

  @ApiProperty({ description: 'Google refresh token' })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
```

## Testing the Implementation

### Step 1: Test the OAuth Flow
1. Navigate to `http://localhost:3000/api/v1/auth/google`
2. You should be redirected to Google's sign-in page
3. After signing in, you'll be redirected back with tokens

### Step 2: Test with Frontend
1. Create a simple HTML page with the JavaScript implementation
2. Click the Google Sign-In button
3. Check the browser's developer tools for any errors
4. Verify that tokens are stored in localStorage

## Security Considerations

1. **CORS Configuration**: Ensure your backend allows requests from your frontend domain
2. **HTTPS in Production**: Always use HTTPS in production
3. **Token Storage**: Consider using secure HTTP-only cookies instead of localStorage
4. **Token Validation**: Always validate tokens on the backend

## Error Handling

```javascript
// Example error handling
async function signInWithGoogle(credential) {
  try {
    const response = await fetch('/api/v1/auth/google/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign-in failed');
    }

    const data = await response.json();
    // Handle success
    
  } catch (error) {
    console.error('Google sign-in error:', error);
    // Show user-friendly error message
    alert('Sign-in failed. Please try again.');
  }
}
```

## Next Steps

1. Choose the implementation method that best fits your frontend framework
2. Update the backend `GoogleLoginDto` if needed
3. Test the implementation thoroughly
4. Add proper error handling and loading states
5. Consider implementing token refresh logic
