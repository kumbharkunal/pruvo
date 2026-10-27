import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// Crawling stays allowed even in demo mode, so crawlers can see the noindex meta tag and header.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
