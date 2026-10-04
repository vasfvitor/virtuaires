import { OGImageRoute } from "astro-og-canvas";

type Page = { frontmatter: { title: string; description: string } };

export const { getStaticPaths, GET } = await OGImageRoute({
  // A collection of pages to generate images for.
  // This can be any map of paths to data, not necessarily a glob result.
  pages: import.meta.glob<Page>("/src/content/**/*.md", { eager: true }),

  // For each page, this callback will be used to customize the OpenGraph
  // image. For example, if `pages` was passed a glob like above, you
  // could read values from frontmatter.
  getImageOptions: (_path, page) => ({
    title: page.frontmatter.title,
    description: page.frontmatter.description,

    // There are a bunch more options you can use here!
  }),
});
