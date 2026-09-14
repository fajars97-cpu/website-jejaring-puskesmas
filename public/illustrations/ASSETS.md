# Community healthcare illustration

- Website asset: `community-care.jpg` (1448 x 1086, JPEG quality 85).
- Generated with the built-in ImageGen tool for this project; not an Unsplash photograph.
- Original: `output/imagegen/community-care-original.png` (local working artifact).

## Facility directory defaults

The `facilities/` folder contains the default card images used when a facility has no uploaded photo. Each is a generated editorial illustration (JPEG quality 85) for one supported category:

- `hospital.jpg` — Rumah Sakit
- `general-clinic.jpg` — Klinik Umum
- `dental-clinic.jpg` — Klinik Gigi
- `circumcision-clinic.jpg` — Klinik Khitan
- `general-practice.jpg` — Tempat Praktik Mandiri Dokter Umum
- `dental-practice.jpg` — Tempat Praktik Mandiri Dokter Gigi
- `midwife-practice.jpg` — Tempat Praktik Mandiri Bidan

The frontend maps `jenis_fasyankes` and `tipe_fasyankes` to these assets in `src/lib/facilityIllustration.js`. A real uploaded photo always takes priority.
- The artwork illustrates community healthcare, not an actual named facility or staff member.
- Font: Manrope Variable, locally bundled through `@fontsource-variable/manrope` (OFL-1.1; license included in the package).

## Final generation prompt

Use case: illustration-story. Asset type: hero illustration for an Indonesian community health clinic network website. Primary request: a polished editorial illustration of accessible community healthcare. Scene: an Indonesian female doctor in a white coat, a nurse wearing a modest green hijab, and a family with a child in a welcoming small clinic courtyard, with a simple clinic building and tropical foliage. Style: sophisticated contemporary flat editorial illustration with subtle paper grain, natural human proportions, restrained detail, warm and reassuring, not childish, no photorealism. Composition: landscape 4:3, complete self-contained scene with generous soft cream negative space around figures, suitable for right half of a homepage hero. Palette: deep forest green #145c49, sage green, warm cream #f6f8f5, muted terracotta accents, natural diverse brown skin tones. No lettering, no words, no logos, no watermark. The image is illustrative, not a depiction of an actual named facility.
