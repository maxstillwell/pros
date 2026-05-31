export async function POST() {
  return Response.json(
    {
      error: "Stripe membership checkout is a TODO for the next build phase.",
    },
    { status: 501 },
  );
}
