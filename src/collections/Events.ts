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
      /*
       * Locked to South African time, deliberately.
       *
       * Without this, Payload stores a bare ISO UTC string and the conversion
       * from the typed wall-clock time depends on whichever timezone the
       * EDITOR'S BROWSER happened to be in. An editor typing "10:00" from
       * Johannesburg stores 08:00Z; the same editor typing "10:00" from London
       * in December, or over a VPN, stores 10:00Z — which reads back as 12:00
       * SAST. Two hours of silent drift per event, with nothing in the stored
       * data to detect it afterwards, and no error at any point.
       *
       * That matters here specifically because Phase 3 hides events by
       * comparing startDate against now: an event drifted two hours late
       * lingers on the site after it has finished, and one drifted early
       * vanishes while it is still running.
       *
       * supportedTimezones deliberately has exactly one entry, so the picker
       * is fixed rather than merely defaulted — an editor cannot pick another
       * by accident. South Africa observes no daylight saving, so UTC+2 holds
       * year-round and there is no seasonal case to get wrong.
       */
      timezone: {
        defaultTimezone: "Africa/Johannesburg",
        supportedTimezones: [{ label: "South Africa (SAST)", value: "Africa/Johannesburg" }],
      },
      admin: {
        description: "Date and start time, in South African time. The site shows the day and month, and hides the event once this has passed.",
        date: { pickerAppearance: "dayAndTime", displayFormat: "d MMM yyyy, HH:mm" },
      },
    },
    {
      name: "location",
      type: "text",
      required: true,
      admin: {
        description: "The line that appears under the title. Usually the place — for example: 146 10th Road, Kew, Johannesburg — and you can add a short note after a · if it helps, for example: The teaching floor, Kew · Schools programme",
      },
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
