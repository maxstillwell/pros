import {
  createSupabaseServiceClient,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/server";

type ProductImageRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function parseDataImage(value: string) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/.exec(
    value,
  );

  if (!match) {
    return null;
  }

  return {
    bytes: Buffer.from(match[2], "base64"),
    contentType: match[1],
  };
}

export async function GET(_request: Request, { params }: ProductImageRouteProps) {
  if (!hasSupabaseServiceConfig()) {
    return new Response("Not found", { status: 404 });
  }

  const { id } = await params;
  const { data: product } = await createSupabaseServiceClient()
    .from("products")
    .select("image_url")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (!product?.image_url) {
    return new Response("Not found", { status: 404 });
  }

  if (!product.image_url.startsWith("data:image/")) {
    return Response.redirect(product.image_url, 302);
  }

  const image = parseDataImage(product.image_url);

  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(image.bytes, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Content-Type": image.contentType,
    },
  });
}
