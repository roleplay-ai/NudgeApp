import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nudgeable AI Fluency",
    short_name: "Nudgeable",
    description: "Daily AI literacy practice",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#FFFDF5",
    theme_color: "#FFFDF5",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
