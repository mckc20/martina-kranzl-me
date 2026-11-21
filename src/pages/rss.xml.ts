import rss from "@astrojs/rss";
import { allEntries, entryUrl, entryTitle } from "@/utils/content";
import migration from "@/data/migration-map.json";
import { SITE } from "@/config";
export async function GET() {
  const entries = await allEntries();
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: entries.map(entry => ({
      link: entryUrl(entry),
      title: entryTitle(entry),
      description:
        entry.data.description ??
        (entry.collection === "photos" ? entry.data.caption : undefined),
      pubDate: entry.data.pubDatetime,
      // The original feed used the old absolute link as its permalink GUID.
      customData: `<guid isPermaLink="false">${new URL(migration.find(item => item.id === entry.id && item.collection === entry.collection)?.oldUrl ?? entryUrl(entry), SITE.website).href}</guid>`,
    })),
  });
}
