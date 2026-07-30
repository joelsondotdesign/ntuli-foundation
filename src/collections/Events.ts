import type { CollectionConfig } from "payload";

export const Events: CollectionConfig = {
  slug: "events",
  labels: { singular: "Event", plural: "Events" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "startDate", "location", "_status"],
    description: "Events shown on the home page. Anything whose date has passed drops off the site automatically — you do not need to delete it.",
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
      name: "startDate",
      type: "date",
      required: true,
      admin: {
        description: "Date and start time. The site shows the day and month, and hides the event once this has passed.",
        date: { pickerAppearance: "dayAndTime", displayFormat: "d MMM yyyy, HH:mm" },
      },
    },
    {
      name: "location",
      type: "text",
      required: true,
      admin: { description: "For example: 146 10th Road, Kew, Johannesburg" },
    },
    {
      name: "actionType",
      type: "select",
      required: true,
      defaultValue: "button",
      options: [
        { label: "A button people can click", value: "button" },
        { label: "A label with no link (e.g. “By invitation”)", value: "label" },
        { label: "Nothing", value: "none" },
      ],
      admin: { description: "What appears at the end of the row." },
    },
    {
      name: "actionLabel",
      type: "text",
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.actionType !== "none",
        description: "For example: Book a place, Apply, or By invitation",
      },
    },
    {
      name: "actionUrl",
      type: "text",
      admin: {
        condition: (_, siblingData) => siblingData?.actionType === "button",
        description: "Where the button goes. An email address works too — write it as mailto:info@ntulifoundation.org",
      },
      validate: (value: string | null | undefined, { siblingData }: { siblingData: Record<string, unknown> }) => {
        if (siblingData?.actionType !== "button") return true;
        if (!value) return "Add a web address or a mailto: link for the button.";
        try {
          new URL(value);
          return true;
        } catch {
          return "That does not look like a web address. Use https://… or mailto:someone@example.com";
        }
      },
    },
  ],
};
