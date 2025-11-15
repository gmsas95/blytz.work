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

    // Use existing Firebase client setup (same as login/signup)
    const { auth } = await import('../../../../lib/firebase');
    const { sendPasswordResetEmail } = await import('firebase/auth');
    
    try {
      // Send password reset email
      await sendPasswordResetEmail(auth, email.toLowerCase());
      
      return Response.json(
        { 
          message: "If your email is registered with us, you will receive a password reset link shortly. Please check your email inbox (including spam folder).",
          success: true 
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Firebase reset password error:", error);
      
      // Handle common Firebase errors
      if (error.code === 'auth/user-not-found') {
        return Response.json(
          { 
            message: "No account found with this email address. Please check your email or sign up for a new account." 
          },
          { status: 404 }
        );
      }
      
      if (error.code === 'auth/invalid-email') {
        return Response.json(
          { 
            message: "The email address is not valid. Please enter a valid email address." 
          },
          { status: 400 }
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