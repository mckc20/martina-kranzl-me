# Bluesky Social Link

## Purpose

Adds a Bluesky profile link to the site's social links section, alongside GitHub, X, LinkedIn, and SpeakerDeck.

## Usage

The Bluesky icon and link appear automatically wherever the `SOCIALS` array from `src/constants.ts` is rendered (footer, about page, etc.). No additional configuration is needed.

## Configuration

The link is defined in `src/constants.ts` as part of the `SOCIALS` array:

```ts
{
  name: "Bluesky",
  href: "https://bsky.app/profile/rafael-cordones.bsky.social",
  linkTitle: `${SITE.title} on Bluesky`,
  icon: IconBluesky,
}
```

To change the profile URL, edit the `href` value in this entry.

## Examples

The Bluesky butterfly icon renders inline with the other social icons and links to the configured Bluesky profile.

## Implementation details

- **Icon**: `src/assets/icons/IconBluesky.svg` — 24x24 SVG using the Tabler icon format (stroke-based, `currentColor`)
- **Constants**: `src/constants.ts` — imports the icon and adds the entry to the `SOCIALS` array
