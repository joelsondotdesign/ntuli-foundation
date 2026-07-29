import type { Access, CollectionConfig } from "payload";

export const isAdmin: Access = ({ req: { user } }) => user?.role === "admin";

export const isAdminOrSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.id === id;
};

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
    group: "Settings",
    hidden: ({ user }) => user?.role !== "admin",
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: { description: "The name shown next to anything this person publishes." },
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Editor — can add and edit content", value: "editor" },
        { label: "Admin — can also manage who has access", value: "admin" },
      ],
      // Same rule as isAdmin above, expressed inline: Payload's FieldAccess
      // type allows a broader `id` type (string | number) than the
      // collection-level Access type does once generated types pin this
      // project's IDs to `number` (Postgres), so the two types aren't
      // structurally assignable under strict mode even though the runtime
      // check is identical. Reusing `isAdmin` here would fail `tsc --strict`.
      access: { update: ({ req: { user } }) => user?.role === "admin" },
      admin: { description: "Only an Admin can change this." },
    },
  ],
};
