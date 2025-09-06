/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      new URL("https://placehold.co/**"),
      new URL(
        "https://newofxgrkewndmnxubzi.supabase.co/storage/v1/object/public/image-transaction/**",
      ),
    ],
  },
};

export default config;
