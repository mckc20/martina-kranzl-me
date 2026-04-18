export const SITE = {
  website: "https://martina-kranzl.me/",
  author: "Martina Kranzl",
  profile: "https://martina-kranzl.me/about/",
  desc: "Fotografie und Zeichnungen aus Wien.",
  title: "martina kranzl",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 5,
  photoblogPostsPerIndex: 12,
  postPerPage: 12,
  photoblogPostsPerPage: 18,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "de", // html lang code. Set this empty and default will be "en"
  timezone: "Europe/Vienna", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
