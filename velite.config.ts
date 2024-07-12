import { defineConfig, s } from "velite";

export default defineConfig({
  collections: {
    posts: {
      name: "Post",
      pattern: "posts/**/*.{md,mdx}",
      schema: s.object({
        title: s.string(),
        date: s.date(),
        content: s.mdx(),
        slug: s.string(),
      }),
    },
  },
});
