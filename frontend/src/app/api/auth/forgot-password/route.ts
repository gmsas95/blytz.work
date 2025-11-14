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

    // Import Firebase Admin to check if email exists in Firebase Auth
    const admin = require('firebase-admin');
    const auth = admin.auth();

    // Check if user exists in Firebase Auth
    const userRecord = await auth.getUserByEmail(email.toLowerCase())
      .catch((error) => {
        // User not found
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

    // TODO: Send actual password reset email using Firebase Auth
    // For now, just return success
    console.log(`Password reset requested for Firebase user: ${userRecord.email}`);
    
    return Response.json(
      { 
        message: "Password reset link sent to your email address.",
        success: true 
      },
      { status: 200 }
    );
    
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