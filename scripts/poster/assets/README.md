# Poster assets

Drop item photos here, then reference the filename in an item's `photo` field
(see `../data/catalog.ts`). Supported: `.jpg`, `.jpeg`, `.png`, `.webp`.

## Resolution

Photos are raster and the cards crop them to fill (`object-fit: cover`), so use
roughly square framing and enough pixels for ~300 DPI at the cell size:

| Poster | 2-column cell ≈ | Min photo (long side) |
| ------ | --------------- | --------------------- |
| A3 | ~133 mm wide | **~1600 px** |
| A2 | ~192 mm wide | **~2300 px** |

Web-store exports (~800 px) will look soft when printed large — use the
originals where you can. If a referenced file is missing, the card renders a
labelled placeholder so the layout still builds.
