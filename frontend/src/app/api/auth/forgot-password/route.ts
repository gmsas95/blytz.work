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

    // Use existing Firebase app and auth from lib/firebase.ts
    const { auth } = await import('../../../lib/firebase');
    const { sendPasswordResetEmail } = await import('firebase/auth');
    
    try {
      await sendPasswordResetEmail(auth, email.toLowerCase());
      
      return Response.json(
        { 
          message: "Password reset link sent to your email address.",
          success: true 
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Firebase reset password error:", error);
      
      if (error.code === 'auth/user-not-found') {
        return Response.json(
          { 
            message: "No account found with this email address. Please check your email or sign up for a new account." 
          },
          { status: 404 }
        );
      }
      
      return Response.json(
        { 
          message: "An error occurred while processing your request. Please try again later." 
        },
        { status: 500 }
      );
    }
    
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