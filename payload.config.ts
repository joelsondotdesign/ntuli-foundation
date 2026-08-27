import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import sharp from "sharp";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { Users } from "./src/collections/Users";
import { Media } from "./src/collections/Media";
import { News } from "./src/collections/News";
import { Events } from "./src/collections/Events";
import { Archive } from "./src/collections/Archive";
import { SiteSettings } from "./src/globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: "users",
    meta: {
      titleSuffix: " · Ntuli Foundation",
      icons: [{ url: "/assets/img/favicon.png" }],
    },
    components: {
      graphics: {
        Logo: "/src/components/admin/Logo.tsx#default",
        Icon: "/src/components/admin/Icon.tsx#default",
      },
    },
  },
  collections: [Users, Media, News, Events, Archive],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
  }),
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
});
