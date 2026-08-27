import type { CollectionConfig } from "payload";
import { parseYouTube } from "@/lib/youtube";

export const Archive: CollectionConfig = {
  slug: "archive",
  labels: { singular: "Archive entry", plural: "Archive" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "type", "creditLine", "_status"],
    description: "Films, lectures, essays and published writing. Videos and writing are filtered separately on the site.",
    group: "Content",
  },
  versions: { drafts: true },
  access: {
    read: ({ req: { user } }) => Boolean(user) || { _status: { equals: "published" } },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "type",
      type: "radio",
      required: true,
      defaultValue: "video",
      options: [
        { label: "Video", value: "video" },
        { label: "Writing", value: "writing" },
      ],
    },
    { name: "title", type: "text", required: true },
    {
      name: "creditLine",
      type: "text",
      admin: { description: "The small line under the title. For example: 2026 · Poetry collection · Botsotso" },
    },
    {
      name: "youtubeUrl",
      type: "text",
      admin: {
        condition: (_, siblingData) => siblingData?.type === "video",
        description: "Paste the whole address from the YouTube page, including any start time. For example: https://www.youtube.com/watch?v=EQwz7M7ZlqM&t=44s",
      },
      validate: (value: string | null | undefined) => {
        if (!value) return true;
        return parseYouTube(value) ? true : "That does not look like a YouTube address. Copy it from your browser's address bar.";
      },
    },
    {
      name: "instagramUrl",
      type: "text",
      admin: {
        condition: (_, siblingData) => siblingData?.type === "video",
        description: "Optional. The address of an Instagram reel.",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Optional for videos — if you leave it blank, the thumbnail comes from YouTube automatically.",
      },
    },
    { name: "description", type: "richText" },
    {
      name: "pdf",
      type: "upload",
      relationTo: "media",
      admin: {
        condition: (_, siblingData) => siblingData?.type === "writing",
        description: "Optional. Adds an 'Open the PDF' button.",
      },
    },
    {
      name: "linkUrl",
      type: "text",
      admin: { description: "Optional. A link out — to a bookshop, gallery or publication." },
    },
    {
      name: "linkLabel",
      type: "text",
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.linkUrl),
        description: "The words on the button. For example: View the book",
      },
    },
    {
      name: "embed",
      type: "json",
      admin: { readOnly: true, hidden: true },
    },
    {
      name: "thumbnailUrl",
      type: "text",
      admin: { readOnly: true, hidden: true },
    },
  ],
  hooks: {
    /*
     * type, youtubeUrl and image are each resolved as `data?.x ?? originalDoc?.x`
     * rather than read straight off `data`, on the same principle behind the
     * News (storyType) fix: a PATCH need not resend every field, and a
     * collection-level beforeChange that branches on `data.x` alone assumes
     * it always will.
     *
     * Verified rather than assumed, and worth recording precisely: on this
     * Payload version (3.86.0), reading `data.x` directly here turns out NOT
     * to reproduce the News bug for these three fields. Before the
     * collection-level beforeChange runs, Payload's own field-level
     * beforeValidate traversal already backfills any omitted top-level field
     * from originalDoc into `data`/`siblingData` — see
     * node_modules/payload/dist/fields/hooks/beforeValidate/promise.js
     * (getFallbackValue → cloneDataFromOriginalDoc). Confirmed with a live
     * A/B test: a PATCH of `{ youtubeUrl: "..." }` alone against the literal
     * brief hook (`data.type` read directly, no fallback) still updated
     * `embed` correctly, and a PATCH of `{ type: "writing" }` alone still
     * cleared `embed`/`thumbnailUrl` correctly — both probes below pass
     * identically whether or not this fallback is present.
     *
     * The fallback is kept anyway: it is harmless, makes the hook correct by
     * construction rather than by an internal merge step this file does not
     * control, and matches the News precedent so the two collections read
     * the same way. But it is not, here, closing a reproduced gap — the
     * News comment this was modelled on should not be read as implying it
     * always is.
     */
    beforeChange: [
      ({ data, originalDoc }) => {
        const type = data?.type ?? originalDoc?.type;
        const youtubeUrl = data?.youtubeUrl ?? originalDoc?.youtubeUrl;
        const image = data?.image ?? originalDoc?.image;
        const ref = type === "video" && youtubeUrl ? parseYouTube(youtubeUrl) : null;
        data.embed = ref ? { provider: "youtube", ...ref } : null;
        data.thumbnailUrl = ref && !image ? `https://i.ytimg.com/vi/${ref.id}/hqdefault.jpg` : null;
        return data;
      },
    ],
  },
};
