import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site settings",
  admin: { group: "Settings" },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Contact",
          fields: [
            { name: "email", type: "email", required: true },
            { name: "phone", type: "text", required: true, admin: { description: "As you want it shown, e.g. +27 83 459 3423" } },
            { name: "addressLine1", type: "text", required: true, admin: { description: "e.g. 146 10th Road, Kew" } },
            { name: "addressLine2", type: "text", required: true, admin: { description: "e.g. Johannesburg, South Africa" } },
          ],
        },
        {
          label: "Social",
          description: "Leave any of these blank and its icon simply will not appear on the site.",
          /*
           * A blank social URL arrives as EITHER null or "" — both are live states:
           *   null  — never filled in, or explicitly cleared via the API
           *   ""    — filled in, then cleared in the admin. Clearing a text input
           *           sets the form value to e.target.value (""), and nothing in
           *           the write path normalises that to null before it persists.
           *
           * The "" case is the likelier one in practice, because it is what the
           * client does. So Phase 3 must treat both as blank — use a truthiness
           * (or trimmed-length) check, never `!== null`. A `!== null` check passes
           * every test we have and then renders an icon linking nowhere the first
           * time someone clears Facebook through the admin. Verified by writing ""
           * and reading it back: it stays "".
           */
          fields: [
            { name: "x", type: "text", label: "X (Twitter)" },
            { name: "instagram", type: "text" },
            { name: "youtube", type: "text", label: "YouTube" },
            { name: "facebook", type: "text" },
            { name: "linkedin", type: "text" },
          ],
        },
        {
          label: "Footer",
          fields: [
            { name: "blurb", type: "textarea", required: true, admin: { description: "The short paragraph under the logo." } },
            { name: "motto", type: "text", required: true, admin: { description: "The italic line at the bottom, e.g. I am because we are." } },
            { name: "newsletterLabel", type: "text", required: true, admin: { description: "e.g. Letters from the threshold" } },
          ],
        },
        {
          label: "Show or hide",
          description: "Turn sections of the site on and off. Nothing is deleted — switch it back on and the content returns.",
          fields: [
            {
              name: "showHomeEvents",
              type: "checkbox",
              defaultValue: false,
              label: "Show 'Upcoming events' on the home page",
              admin: { description: "This also hides itself automatically whenever there are no events still to come." },
            },
            { name: "showHomeNews", type: "checkbox", defaultValue: true, label: "Show 'From the threshold' on the home page" },
            { name: "showCookieNotice", type: "checkbox", defaultValue: true, label: "Show the cookie notice" },
          ],
        },
      ],
    },
  ],
};
