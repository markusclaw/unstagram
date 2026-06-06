import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UNSTAGRAM",
    short_name: "UNSTAGRAM",
    description: "Photos you read, not see.",
    start_url: "/",
    display: "standalone",
    background_color: "#0D0D0D",
    theme_color: "#0D0D0D",
  };
}
