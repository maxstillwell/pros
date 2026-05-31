export async function POST() {
  return Response.json(
    {
      error: "Stripe webhook handling is a TODO for the next build phase.",
    },
    { status: 501 },
  );
}
