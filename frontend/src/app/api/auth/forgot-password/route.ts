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

    // Try to import Firebase Admin
    let admin;
    try {
      const adminModule = await import('firebase-admin');
      admin = adminModule.default || adminModule;
    } catch (importError) {
      console.error("Failed to import firebase-admin:", importError);
      return Response.json(
        { 
          message: "Authentication service is currently unavailable. Please try again later." 
        },
        { status: 500 }
      );
    }

    if (!admin) {
      return Response.json(
        { 
          message: "Authentication service is currently unavailable. Please try again later." 
        },
        { status: 500 }
      );
    }
    
    try {
      // Check if user exists in Firebase Admin
      const userRecord = await admin.auth().getUserByEmail(email.toLowerCase())
        .catch((error: any) => {
          if (error.code === 'auth/user-not-found') {
            return null;
          }
          console.error("Error checking user:", error);
          return null;
        });

      if (!userRecord) {
        return Response.json(
          { 
            message: "No account found with this email address. Please check your email or sign up for a new account." 
          },
          { status: 404 }
        );
      }

      // Send password reset email using Firebase Admin
      await admin.auth().sendPasswordResetEmail(email.toLowerCase());
      
      return Response.json(
        { 
          message: "If your email is registered with us, you will receive a password reset link shortly. Please check your email inbox (including spam folder).",
          success: true 
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Firebase Admin error:", error);
      
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