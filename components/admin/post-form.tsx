import type { BlogPost } from "@/lib/blog";
import type { PostStatus, PostVisibility } from "@/types/database";

type PostFormProps = {
  post?: BlogPost;
};

const postStatuses: PostStatus[] = ["draft", "published"];
const postVisibilities: PostVisibility[] = ["public", "members_only"];

const inputClass =
  "mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20";
const textareaClass =
  "mt-2 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20";
const labelClass = "block text-sm font-semibold text-forest-900";

export function PostFormFields({ post }: PostFormProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <input
        type="hidden"
        name="existing_published_at"
        value={post?.published_at ?? ""}
      />
      <label className={`${labelClass} md:col-span-2`}>
        Title
        <input
          name="title"
          required
          defaultValue={post?.title ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Slug
        <input
          name="slug"
          defaultValue={post?.slug ?? ""}
          placeholder="auto-created from title if blank"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Visibility
        <select
          name="visibility"
          defaultValue={post?.visibility ?? "public"}
          className={inputClass}
        >
          {postVisibilities.map((visibility) => (
            <option key={visibility} value={visibility}>
              {visibility.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Status
        <select
          name="status"
          defaultValue={post?.status ?? "draft"}
          className={inputClass}
        >
          {postStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className={`${labelClass} md:col-span-2`}>
        Excerpt
        <textarea
          name="excerpt"
          rows={3}
          defaultValue={post?.excerpt ?? ""}
          className={textareaClass}
        />
      </label>
      <label className={`${labelClass} md:col-span-2`}>
        Body
        <textarea
          name="body"
          rows={16}
          defaultValue={post?.body ?? ""}
          className={textareaClass}
        />
      </label>
    </div>
  );
}
