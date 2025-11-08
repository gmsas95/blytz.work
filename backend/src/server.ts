import Fastify from "fastify";
import cors from "@fastify/cors";
import env from "@fastify/env";

// Import routes
import healthRoutes from "./routes/health.js";
import vaRoutes from "./routes/va.js";
import companyRoutes from "./routes/company.js";
import matchingRoutes from "./routes/matching.js";
import paymentRoutes from "./routes/payments.js";

// Environment schema
const envSchema = {
  type: "object",
  required: ["DATABASE_URL", "FIREBASE_PROJECT_ID", "STRIPE_SECRET_KEY"],
  properties: {
    DATABASE_URL: { type: "string" },
    FIREBASE_PROJECT_ID: { type: "string" },
    FIREBASE_CLIENT_EMAIL: { type: "string" },
    FIREBASE_PRIVATE_KEY: { type: "string" },
    STRIPE_SECRET_KEY: { type: "string" },
    STRIPE_WEBHOOK_SECRET: { type: "string" },
    PORT: { type: "string", default: "3000" },
    NODE_ENV: { type: "string", default: "development" },
  },
};

const app = Fastify({
  logger: true,
});

// Register plugins
app.register(cors, {
  origin: process.env.NODE_ENV === "production" 
    ? ["https://yourdomain.com"] 
    : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
});

app.register(env, {
  schema: envSchema,
});

// Register routes
app.register(healthRoutes);
app.register(vaRoutes, { prefix: "/api" });
app.register(companyRoutes, { prefix: "/api" });
app.register(matchingRoutes, { prefix: "/api" });
app.register(paymentRoutes, { prefix: "/api" });

// Error handler
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);
  
  if (error.validation) {
    return reply.code(400).send({
      error: "Validation error",
      details: error.validation,
    });
  }

  return reply.code(500).send({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// Start server
const start = async () => {
  try {
    await app.ready();
    await app.listen({ 
      port: parseInt(process.env.PORT || "3000"), 
      host: "0.0.0.0" 
    });
    app.log.info(`Server listening on port ${process.env.PORT || 3000}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Export app for testing
export { app };

// Start server
start();