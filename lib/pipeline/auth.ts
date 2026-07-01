// Lightweight operator gate for pipeline write/discovery endpoints.
// Set OPERATOR_PASSPHRASE (env / CF secret) in production; when unset the
// endpoints are open for local dev. Full Supabase Auth is the prod upgrade.
export function operatorAuthorized(req: Request): boolean {
  const required = process.env.OPERATOR_PASSPHRASE;
  if (!required) return true;
  return req.headers.get("x-operator-key") === required;
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}
