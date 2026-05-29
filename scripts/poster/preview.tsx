import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import slugify from "slugify";
import { eventCatalogs } from "./data/event-catalog";
import { buildHtml, resolveImage } from "./lib/document";
import { getDimensions } from "./lib/sizes";
import { EventCatalogPoster } from "./templates/EventCatalogPoster";

// PNG preview for fast layout iteration (no PDF viewer needed). Renders each
// catalog at screen resolution (96 DPI) to out/<slug>.png.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(HERE, "out");
const PX_PER_MM = 96 / 25.4;

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

      await page.setViewport({
        width: Math.ceil(dims.full.w * PX_PER_MM),
        height: Math.ceil(dims.full.h * PX_PER_MM),
        deviceScaleFactor: 1,
      });
      await page.setContent(html, { waitUntil: "load" });
      await page.evaluate(async () => {
        await Promise.race([
          document.fonts.ready,
          new Promise((r) => setTimeout(r, 5000)),
        ]);
      });

      const name =
        (data.slug ?? slugify(data.title, { lower: true, strict: true })) + ".png";
      await page.screenshot({ path: path.join(OUT_DIR, name) });
      console.log(`✓ ${name}  (${data.size} ${data.orientation})`);
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
