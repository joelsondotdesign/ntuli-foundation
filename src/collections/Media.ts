import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "Settings",
    description: "Images and PDFs. Uploads are resized automatically — you do not need to prepare them first.",
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    mimeTypes: ["image/*", "application/pdf"],
    formatOptions: { format: "webp", options: { quality: 82 } },
    // Each size needs its OWN formatOptions. The collection-level
    // formatOptions above only converts the originally saved file — Payload's
    // createImageSizes applies `imageResizeConfig.formatOptions` per size, so
    // a size without it inherits the SOURCE format. Verified by measurement:
    // with these omitted, a 1.7 MB JPEG produced three .jpg sizes, hero at
    // 900 KB — half the original, not the small WebP the spec promises.
    // Quality matches the collection-level setting so there is one quality
    // story rather than four.
    imageSizes: [
      {
        name: "thumb",
        width: 640,
        height: undefined,
        position: "centre",
        formatOptions: { format: "webp", options: { quality: 82 } },
      },
      {
        name: "card",
        width: 1024,
        height: undefined,
        position: "centre",
        formatOptions: { format: "webp", options: { quality: 82 } },
      },
      {
        name: "hero",
        width: 1920,
        height: undefined,
        position: "centre",
        formatOptions: { format: "webp", options: { quality: 82 } },
      },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description:
          "Describe the image for someone who cannot see it — for example “Prof Ntuli carving a bone sculpture in the Kew studio”. For a PDF, its title is fine.",
      },
    },
  ],
};
