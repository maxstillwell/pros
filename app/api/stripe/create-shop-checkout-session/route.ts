export async function POST() {
  return Response.json(
    {
      error: "Shop checkout is a TODO for a later shop phase.",
    },
    { status: 501 },
  );
}
