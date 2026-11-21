import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { sanitiseImage } from "../src/utils/sanitiseImages.ts";

test("camera and phone-style orientations strip private metadata and retain correct dimensions/colour", async () => {
  for (const orientation of [1, 6, 8]) {
    const source = await sharp({
      create: {
        width: 40,
        height: 20,
        channels: 3,
        background: { r: 150, g: 80, b: 35 },
      },
    })
      .jpeg()
      .withMetadata({ orientation })
      .withExifMerge({
        IFD0: {
          Make: "Test Camera",
          Model: "Phone",
          Copyright: "Private owner",
          Artist: "Private owner",
        },
        IFD2: { LensModel: "Private lens" },
        IFD3: { GPSLatitudeRef: "N", GPSLatitude: "48/1 12/1 0/1" },
      })
      .toBuffer();
    const original = await sharp(source).metadata();
    assert.ok(original.exif);
    const clean = await sanitiseImage(source);
    const metadata = await sharp(clean).metadata();
    for (const key of ["exif", "xmp", "iptc", "icc", "orientation"] as const)
      assert.equal(metadata[key], undefined);
    assert.equal(metadata.width, orientation === 1 ? 40 : 20);
    assert.equal(metadata.height, orientation === 1 ? 20 : 40);
    const pixel = await sharp(clean).raw().toBuffer();
    assert.ok(
      Math.abs(pixel[0] - 150) < 5 &&
        Math.abs(pixel[1] - 80) < 5 &&
        Math.abs(pixel[2] - 35) < 5
    );
  }
});
