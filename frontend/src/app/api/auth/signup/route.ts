// Backend proxy for Firebase sign-up to bypass client-side network issues
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

    // Use Firebase client SDK on backend to avoid network restrictions
    const { getFirebase } = await import('../../../../lib/firebase-runtime-final');
    const { auth } = getFirebase();
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with name if provided
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      
      const token = await userCredential.user.getIdToken();
      
      return Response.json(
        { 
          success: true,
          user: {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName || name
          },
          token: token
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Firebase sign-up error:", error);
      
      // Handle common Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        return Response.json(
          { 
            error: "An account already exists with this email address" 
          },
          { status: 409 }
        );
      }
      
      if (error.code === 'auth/invalid-email') {
        return Response.json(
          { 
            error: "The email address is not valid" 
          },
          { status: 400 }
        );
      }
      
      if (error.code === 'auth/weak-password') {
        return Response.json(
          { 
            error: "Password should be at least 6 characters" 
          },
          { status: 400 }
        );
      }
      
      if (error.code === 'auth/too-many-requests') {
        return Response.json(
          { 
            error: "Too many attempts. Please try again later" 
          },
          { status: 429 }
        );
      }
      
      // Network error handling
      if (error.code === 'auth/network-request-failed') {
        console.error('Network request failed on backend - this indicates Firebase configuration issues');
        return Response.json(
          { 
            error: "Authentication service temporarily unavailable. Please try again later" 
          },
          { status: 503 }
        );
      }
      
      return Response.json(
        { 
          error: "Account creation failed. Please try again" 
        },
        { status: 500 }
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