// Frontend API route that proxies to backend for Firebase sign-up
export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return Response.json(
        {
          error: "Email and password are required"
        },
        { status: 400 }
      );
    }

    // Forward the request to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    try {
      const response = await fetch(`${backendUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      
      return Response.json(data, { status: response.status });
      
    } catch (error: any) {
      console.error("Backend request error:", error);
      
      // Network error handling
      return Response.json(
        {
          error: "Authentication service temporarily unavailable. Please try again later"
        },
        { status: 503 }
      );
    }
    
  } catch (error) {
    console.error("Sign-up API error:", error);
    return Response.json(
      {
        error: "An error occurred during sign up"
      },
      { status: 500 }
    );
  }
}