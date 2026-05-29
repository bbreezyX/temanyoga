import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import slugify from "slugify";
import { eventCatalogs } from "./data/event-catalog";
import { buildHtml, resolveImage } from "./lib/document";
import { getDimensions } from "./lib/sizes";
import { EventCatalogPoster } from "./templates/EventCatalogPoster";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(HERE, "out");

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    for (const data of eventCatalogs) {
      const dims = getDimensions(data.size, data.orientation);
      const photos = Object.fromEntries(
        data.items.map((it) => [it.photo, resolveImage(it.photo)]),
      );
      const html = buildHtml(
        <EventCatalogPoster
          data={data}
          dims={dims}
          photos={photos}
          logo={resolveImage(data.logo)}
        />,
        dims,
      );

      await page.setContent(html, { waitUntil: "load" });
      // Wait for webfonts, but never block the render if the CDN is slow/offline.
      await page.evaluate(async () => {
        await Promise.race([
          document.fonts.ready,
          new Promise((r) => setTimeout(r, 5000)),
        ]);
      });

      const name =
        (data.slug ?? slugify(data.title, { lower: true, strict: true })) + ".pdf";
      await page.pdf({
        path: path.join(OUT_DIR, name),
        printBackground: true,
        preferCSSPageSize: true,
      });
      console.log(
        `✓ ${name}  —  ${data.size} ${data.orientation}, ${data.items.length} item, ` +
          `${dims.full.w}×${dims.full.h}mm incl. ${dims.bleed}mm bleed`,
      );
    }
  } finally {
    await browser.close();
  }
  console.log(`\nDone → ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
