export function get() {
  return new Response(new Date().toISOString());
}
