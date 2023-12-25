export function onServer () {
  return new Response(new Date().toISOString(), {
    status: 200,
  })
}
