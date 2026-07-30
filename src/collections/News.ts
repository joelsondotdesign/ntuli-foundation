import type { CollectionConfig } from "payload";

/**
 * Turns a title into a URL slug. Returns null — never "" — when the title
 * contains nothing this can use.
 *
 * Returning null rather than undefined is load-bearing. Payload's field hook
 * runner assigns the result only when it is not undefined:
 *
 *     if (hookedValue !== undefined) { siblingData[field.name] = hookedValue }
 *     — payload/dist/fields/hooks/beforeValidate/promise.js
 *
 * so returning undefined would leave the incoming "" in place, which is the
 * exact value we are trying to avoid storing. null IS assigned, and stores as
 * SQL NULL. Postgres permits many NULLs in a unique index but only one '', so
 * this is what stops a second title-with-no-Latin-characters colliding.
 *
 * This matters here specifically: the foundation's subject matter is isiZulu
 * and pan-African, so a title in a script NFD cannot decompose to ASCII
 * (Ge'ez, N'Ko, Arabic, Tifinagh) is ordinary input, not an edge case.
 */
const slugify = (source: string): string | null => {
  const slug = source
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || null;
};

export const News: CollectionConfig = {
  slug: "news",
  labels: { singular: "News item", plural: "News" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "date", "category", "_status"],
    description: "Books, exhibitions, opinions and announcements. The newest published item is featured on the News page, and the newest three appear on the home page.",
    group: "Content",
  },
  versions: { drafts: true },
  hooks: {
    /*
     * Clear whichever side of the link/article choice does not apply, so a
     * document can never carry both a linkUrl and a slug/body at once.
     *
     * This is a data-shape guarantee for the Phase 3 renderer, not tidiness.
     * Without it the schema invites presence-based branching:
     *
     *     item.linkUrl ? <a href={item.linkUrl}> : <Link href={`/news/${item.slug}`}>
     *
     * which is the natural way to write it and is wrong, because both fields
     * can be populated on the same document after the author changes their
     * mind. Measured before this hook existed: switching a story from link to
     * article left linkUrl set to a previously REJECTED value ("not-a-url"),
     * which a presence check would have emitted as a live href. The reverse
     * left a stale slug still occupying the unique index, plus an orphaned body.
     *
     * storyType falls back to originalDoc because a PATCH need not resend it;
     * without that fallback a partial update would skip both branches and let
     * the stale value survive.
     */
    beforeChange: [
      ({ data, originalDoc }) => {
        const storyType = data?.storyType ?? originalDoc?.storyType;
        if (storyType === "link") {
          data.slug = null;
          data.body = null;
        } else if (storyType === "article") {
          data.linkUrl = null;
        }
        return data;
      },
    ],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user) || { _status: { equals: "published" } },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "date",
      type: "date",
      required: true,
      admin: {
        description: "Shown on the card, and used to order the list.",
        date: { pickerAppearance: "dayOnly", displayFormat: "d MMM yyyy" },
      },
    },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Book", value: "book" },
        { label: "Exhibition", value: "exhibition" },
        { label: "Opinion", value: "opinion" },
        { label: "Interview", value: "interview" },
        { label: "Announcement", value: "announcement" },
      ],
      admin: { description: "Shown as the small label on the card." },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "The thumbnail. Landscape images work best." },
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      maxLength: 300,
      admin: { description: "One or two sentences. Shown on the featured card and used as the page description in search results." },
    },
    {
      name: "storyType",
      type: "radio",
      required: true,
      defaultValue: "link",
      options: [
        { label: "A link to an article elsewhere", value: "link" },
        { label: "An article on this site", value: "article" },
      ],
      admin: { description: "Choose 'elsewhere' for press coverage. Choose 'on this site' to write it yourself." },
    },
    {
      name: "linkUrl",
      type: "text",
      // Deliberate and inert: `required` does not fire while the field is
      // hidden by the condition below, so the custom validate is what actually
      // enforces this. Kept only for the asterisk it puts next to the label.
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.storyType === "link",
        description: "Paste the full web address of the article, including https://",
      },
      validate: (value: string | null | undefined, { siblingData }: { siblingData: Record<string, unknown> }) => {
        if (siblingData?.storyType !== "link") return true;
        if (!value) return "Add the web address of the article you are linking to.";
        try {
          new URL(value);
          return true;
        } catch {
          return "That does not look like a complete web address. It should start with https://";
        }
      },
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      admin: {
        condition: (_, siblingData) => siblingData?.storyType === "article",
        description: "The address this article will live at, e.g. palestine-in-my-heart. Filled in from the title if you leave it blank.",
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            if ((siblingData as { storyType?: string })?.storyType !== "article") return value;
            const source = value || (siblingData as { title?: string })?.title || "";
            return slugify(source.toString());
          },
        ],
      },
      /*
       * The slug hook above can legitimately produce nothing — a title that is
       * punctuation-only, or written in a script with no Latin characters, has
       * no automatic address. That stores as NULL rather than "", so it no
       * longer collides on the unique index; but the article still has no
       * address, which the author needs to know about before it goes live.
       *
       * Drafts skip field validation in Payload, so this does not block saving
       * work in progress — it fires on publish, which is the right moment.
       */
      validate: (value: string | null | undefined, { siblingData }: { siblingData: Record<string, unknown> }) => {
        if (siblingData?.storyType !== "article") return true;
        if (!value) {
          return "Please add a web address for this article — the title does not produce one automatically.";
        }
        return true;
      },
    },
    {
      name: "body",
      type: "richText",
      admin: {
        condition: (_, siblingData) => siblingData?.storyType === "article",
        description: "The article itself.",
      },
    },
    {
      name: "alsoInArchive",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Also list this in the Archive. Use for writing that belongs in the permanent record, not for press mentions.",
      },
    },
  ],
};
