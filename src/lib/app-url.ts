export function getAppUrl() {
  return process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000";
}
