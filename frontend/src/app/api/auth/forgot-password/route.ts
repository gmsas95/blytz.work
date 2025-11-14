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

    // Import Prisma to check if email exists in actual database
    const { prisma } = await import("@/utils/prisma");

    // Check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      select: {
        email: true,
      }
    });

    if (!existingUser) {
      return Response.json(
        { 
          message: "No account found with this email address. Please check your email or sign up for a new account." 
        },
        { status: 404 }
      );
    }

    // TODO: Replace with actual email sending service
    // For now, just return success
    console.log(`Password reset requested for existing user: ${existingUser.email}`);
    
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