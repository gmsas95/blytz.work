// Backend proxy for Firebase sign-in to bypass client-side network issues
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

    // Use Firebase client SDK on backend to avoid network restrictions
    const { getFirebase } = await import('../../../../lib/firebase-runtime-final');
    const { auth } = getFirebase();
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    
    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      return Response.json(
        { 
          success: true,
          user: {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName
          },
          token: token
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Firebase sign-in error:", error);
      
      // Handle common Firebase errors
      if (error.code === 'auth/user-not-found') {
        return Response.json(
          { 
            error: "No account found with this email address" 
          },
          { status: 404 }
        );
      }
      
      if (error.code === 'auth/wrong-password') {
        return Response.json(
          { 
            error: "Incorrect password" 
          },
          { status: 401 }
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
      
      if (error.code === 'auth/too-many-requests') {
        return Response.json(
          { 
            error: "Too many failed attempts. Please try again later" 
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
          error: "Authentication failed. Please try again" 
        },
        { status: 500 }
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