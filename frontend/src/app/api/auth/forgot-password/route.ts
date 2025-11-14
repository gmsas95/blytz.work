export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return Response.json(
        { 
          message: "Please enter a valid email address" 
        },
        { status: 400 }
      );
    }

    // Forward to backend API which has Firebase Admin
    const backendUrl = process.env.BACKEND_URL || 'https://hyred-api.blytz.app';
    console.log("Calling backend API:", `${backendUrl}/auth/forgot-password`);
    
    const backendResponse = await fetch(`${backendUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend API error:", backendResponse.status, errorText);
      
      return Response.json(
        { 
          message: "Failed to connect to authentication service. Please try again later." 
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log("Backend response:", data);

    return Response.json(data, {
      status: 200
    });
    
  } catch (error) {
    console.error("Password reset API error:", error);
    return Response.json(
      { 
        message: "An error occurred while processing your request. Please try again later." 
      },
      { status: 500 }
    );
  }
}