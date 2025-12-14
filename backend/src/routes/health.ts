export default async function healthRoutes(app: any) {
  app.get("/health", async () => {
    return { ok: true, timestamp: new Date().toISOString() };
  });
  
  // Add health check with /api prefix for consistency
  app.get("/api/health", async () => {
    return { ok: true, timestamp: new Date().toISOString() };
  });
}