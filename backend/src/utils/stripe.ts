import Stripe from "stripe";

const stripe = process.env.NODE_ENV === 'test' || !process.env.STRIPE_SECRET_KEY
  ? null as any
  : new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });

export const PLATFORM_FEE_PERCENT = 0.1; // 10% platform fee

export async function createPaymentIntent(matchId: string, amount: number) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        matchId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to create payment intent: ${error}`);
  }
}

export async function confirmPayment(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment not successful");
    }

    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to confirm payment: ${error}`);
  }
}

export { stripe };