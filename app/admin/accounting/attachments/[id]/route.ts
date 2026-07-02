import { getAdminAccess } from "@/lib/auth/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const accountingAttachmentBucket = "accounting-attachments";

type AttachmentRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function contentDisposition(filename: string) {
  const fallback = filename
    .replace(/[^\x20-\x7e]/g, "")
    .replaceAll('"', "")
    .trim();

  return `attachment; filename="${fallback || "attachment"}"; filename*=UTF-8''${encodeURIComponent(
    filename,
  )}`;
}

export async function GET(_request: Request, { params }: AttachmentRouteProps) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return new Response("Not authorised.", { status: 401 });
  }

  const { id } = await params;
  const supabase = createSupabaseServiceClient();
  const { data: attachment } = await supabase
    .from("accounting_attachments")
    .select("*")
    .eq("id", id)
    .single();

  if (!attachment) {
    return new Response("Attachment not found.", { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from(accountingAttachmentBucket)
    .download(attachment.file_path);

  if (error || !data) {
    return new Response("Attachment could not be downloaded.", { status: 404 });
  }

  return new Response(await data.arrayBuffer(), {
    headers: {
      "Content-Disposition": contentDisposition(attachment.file_name),
      "Content-Length": String(attachment.file_size),
      "Content-Type": attachment.mime_type,
    },
  });
}
