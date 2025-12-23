// Frontend API route that proxies to backend for Firebase sign-in
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        {
          error: "Email and password are required"
        },
        { status: 400 }
      );
    }

    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    try {
      const response = await fetch(`${backendUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
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
    console.error("Sign-in API error:", error);
    return Response.json(
      {
        error: "An error occurred during sign in"
      },
      { status: 500 }
    );
  }
}