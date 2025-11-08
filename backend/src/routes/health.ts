export default async function healthRoutes(app: any) {
  app.get("/health", async () => {
    return { ok: true, timestamp: new Date().toISOString() };
  });
}