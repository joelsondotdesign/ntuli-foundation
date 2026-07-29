export type ArchiveEntry = {
  kind: "Video" | "Writing";
  title: string;
  meta?: string;
  image?: string;
  excerpt?: string;
  body?: string[];
  embed?: { provider: "youtube"; id: string; start?: number } | { provider: "instagram"; url: string };
  link?: { href: string; label: string };
  pdf?: string;
  placeholder?: boolean;
};

export const ARCHIVE: ArchiveEntry[] = [
  {
    kind: "Writing",
    title: "Palestine in My Heart",
    meta: "2026 · Poetry collection · Botsotso",
    image: "/assets/img/news-book.jpg",
    excerpt:
      "A collection blending lyrical empathy and satire in solidarity with Palestine, illustrated with the poet's own sculptures.",
    body: [
      "A new poetry collection from sculptor-poet Pitika Ntuli, blending lyrical empathy and satire in solidarity with Palestine — illustrated with his own sculptures.",
      "Published by Botsotso, the collection continues a lifelong practice in which poem and sculpture are made in the same breath: the written line and the carved line reaching for the same act of witness.",
    ],
    link: {
      href: "https://www.amazon.fr/-/en/Pitika-Ntuli/dp/0639878504",
      label: "View the book",
    },
  },
  {
    kind: "Writing",
    title: "Freedom Charter at 70: its value has been lost",
    meta: "2026 · Opinion · SABC Channel Africa",
    image: "/assets/img/news-freedom.jpg",
    excerpt:
      "Prof Ntuli reflects on seventy years of the Freedom Charter, and on the distance between the promise and the country that followed.",
    body: [
      "Marking the seventieth anniversary of the Freedom Charter, Prof Pitika Ntuli reflects on promises abandoned, the drift of neo-colonialism, and the urgent need for an ideology capable of carrying the charter forward.",
      "The full interview is published by SABC Channel Africa.",
    ],
    link: {
      href: "http://web.sabc.co.za/sabc/home/channelafrica/news/details?id=753e6f0e-8657-4dfc-afcf-3ad3aaf99c82&title=SA%20has%20betrayed%20Freedom%20Charter:%20Professor%20%C2%A0",
      label: "Read the interview",
    },
  },
  {
    kind: "Writing",
    title: "Junkyard Dogs: turning waste into witness",
    meta: "2026 · Exhibition · The Melrose Gallery",
    image: "/assets/img/news-junkyard.webp",
    excerpt: "Pitika Ntuli and Willie Bester reassemble industrial waste into fierce, unflinching sculpture.",
    body: [
      "Two South African icons, Pitika Ntuli and Willie Bester, reassemble industrial waste into fierce, unflinching sculptures — industry re-membered into witness.",
      "Presented as a viewing room by The Melrose Gallery.",
    ],
    link: {
      href: "https://themelrosegallery.com/viewing-room/49-junkyard-dogs-with-pitika-ntuli-and-willie-bester/",
      label: "Enter the viewing room",
    },
  },
  {
    kind: "Video",
    title: "Eating my Art",
    meta: "Documentary · HISTORY AFRICA",
    image: "https://i.ytimg.com/vi/EQwz7M7ZlqM/hqdefault.jpg",
    embed: { provider: "youtube", id: "EQwz7M7ZlqM", start: 44 },
    body: [
      "Prof Pitika Ntuli on a practice where nothing is wasted and everything is transformed: bone, the material of memory, carved into works that feed the spirit.",
    ],
  },
  {
    kind: "Video",
    title: "Never lose the child inside you",
    meta: "Conversation · Sir Max Network",
    image: "https://i.ytimg.com/vi/rj-FctAmgjk/hqdefault.jpg",
    embed: { provider: "youtube", id: "rj-FctAmgjk" },
    body: ["Prof Ntuli on play, curiosity and the child's eye as the wellspring of a lifetime of making."],
  },
  {
    kind: "Video",
    title: "Resurrecting memory through sculpture",
    meta: "Podcast, episode 24 · Sir Max Network",
    image: "https://i.ytimg.com/vi/-F5ePSm3HHc/hqdefault.jpg",
    embed: { provider: "youtube", id: "-F5ePSm3HHc" },
    body: [
      "A long-form conversation with Prof Pitika Ntuli on sculpture as an act of re-membering: recovering what history scattered and giving it form again.",
    ],
  },
  {
    kind: "Video",
    title: "Pitika Ntuli: sculptor, poet and former freedom fighter",
    meta: "Interview · eNCA",
    image: "https://i.ytimg.com/vi/r_zSByDvknI/hqdefault.jpg",
    embed: { provider: "youtube", id: "r_zSByDvknI" },
    body: [
      "eNCA profiles Prof Ntuli across the three lives he has lived at once: the sculptor, the poet, and the freedom fighter in exile.",
    ],
  },
];
