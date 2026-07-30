import type { CollectionConfig } from "payload";

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
            return source
              .toString()
              .toLowerCase()
              .normalize("NFD")
              .replace(/[̀-ͯ]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
          },
        ],
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
