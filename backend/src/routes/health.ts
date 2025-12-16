export default async function healthRoutes(app: any) {
  app.get("/health", async (request: any, reply: any) => {
    reply.code(200).send({ ok: true, timestamp: new Date().toISOString() });
  });
  
  // Add health check with /api prefix for consistency
  app.get("/api/health", async (request: any, reply: any) => {
    reply.code(200).send({ ok: true, timestamp: new Date().toISOString() });
  });
}