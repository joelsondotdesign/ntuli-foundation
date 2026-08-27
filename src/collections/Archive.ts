import type { CollectionConfig } from "payload";
import { parseYouTube } from "@/lib/youtube";
import { parseInstagram } from "@/lib/instagram";

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
        description: "Optional. The address of an Instagram reel. Used only if there is no YouTube address above.",
      },
      validate: (value: string | null | undefined) => {
        if (!value) return true;
        return parseInstagram(value) ? true : "That does not look like an Instagram address. Copy it from your browser's address bar — it should contain instagram.com";
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "The picture shown on the card. Optional for a video with a YouTube address — leave it blank and the thumbnail is taken from YouTube automatically.",
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
     * Every field below is read straight off `data`, with NO
     * `?? originalDoc?.x` fallback. That is deliberate, and it is the opposite
     * of what it looks like, so it is worth stating why.
     *
     * A partial PATCH does not need the fallback here. Before this
     * collection-level beforeChange runs, Payload's own field-level
     * beforeValidate traversal already backfills every named field that the
     * request OMITTED from originalDoc into `data` — see
     * node_modules/payload/dist/fields/hooks/beforeValidate/promise.js
     * (getFallbackValue → cloneDataFromOriginalDoc). So `data.type` on a PATCH
     * that never mentioned `type` is already the stored value. Verified by
     * A/B test, not assumed.
     *
     * Adding `?? originalDoc?.x` on top of that is not merely redundant — for
     * `image` it is an ACTIVE BUG, which is how it was found. `??` cannot tell
     * "field absent" from "field explicitly set to null", but Payload can and
     * does: clearing an upload field sends a real `null`, which the sanitizer
     * preserves rather than backfilling. So `data.image ?? originalDoc.image`
     * resurrects the just-removed image, `thumbnailUrl` is computed as though
     * a picture were still attached, and it stays null instead of reverting to
     * the YouTube thumbnail. Measured: attach image -> thumbnailUrl null
     * (correct); remove image -> thumbnailUrl STILL null (wrong, should be the
     * YouTube URL again). Reading `data.image` directly gets all three cases
     * right — set, cleared, and omitted — because Payload has already resolved
     * the distinction the fallback would destroy.
     */
    beforeChange: [
      ({ data }) => {
        /*
         * Clear the inapplicable side of the video/writing choice, so a
         * document can never carry both shapes at once. Same guarantee, and
         * same reasoning, as the News collection's storyType hook: without
         * this, switching an entry from Video to Writing leaves its old
         * youtubeUrl/instagramUrl in the record, hidden from the editor by the
         * field conditions but still visible to Phase 3 — which is exactly the
         * stale-field trap that presence-based rendering falls into.
         */
        if (data.type === "writing") {
          data.youtubeUrl = null;
          data.instagramUrl = null;
        } else if (data.type === "video") {
          data.pdf = null;
        }

        // YouTube wins when both addresses are present; Instagram is the
        // fallback so an Instagram-only entry still produces a usable embed
        // rather than silently rendering nothing.
        const youtube = data.type === "video" && data.youtubeUrl ? parseYouTube(data.youtubeUrl) : null;
        const instagram = !youtube && data.type === "video" && data.instagramUrl ? parseInstagram(data.instagramUrl) : null;

        if (youtube) {
          data.embed = { provider: "youtube", ...youtube };
        } else if (instagram) {
          data.embed = { provider: "instagram", url: instagram };
        } else {
          data.embed = null;
        }

        // Only YouTube supplies an automatic thumbnail; Instagram has no
        // equivalent public still, so an Instagram-only entry needs its own
        // uploaded image.
        data.thumbnailUrl = youtube && !data.image ? `https://i.ytimg.com/vi/${youtube.id}/hqdefault.jpg` : null;
        return data;
      },
    ],
  },
};
