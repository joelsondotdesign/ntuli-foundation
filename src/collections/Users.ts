import type { CollectionConfig } from "payload";

// Minimal Users collection to unblock Payload's boot (admin.user: "users").
// This is intentionally bare — roles and access control are Task 4's
// deliverable, not this one.
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
