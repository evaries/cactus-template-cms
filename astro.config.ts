import { defineConfig } from "astro/config";
import fs from "fs";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import remarkUnwrapImages from "remark-unwrap-images";
import rehypeExternalLinks from "rehype-external-links";
import { remarkReadingTime } from "./src/utils/remark-reading-time";
import icon from "astro-icon";
import NetlifyCMS from "astro-netlify-cms";

// https://astro.build/config
export default defineConfig({
	// ! Please remember to replace the following site property with your own domain
	site: "https://cactus-basic.netlify.app",
	markdown: {
		remarkPlugins: [remarkUnwrapImages, remarkReadingTime],
		rehypePlugins: [
			[rehypeExternalLinks, { target: "_blank", rel: ["nofollow, noopener, noreferrer"] }],
		],
		remarkRehype: { footnoteLabelProperties: { className: [""] } },
		shikiConfig: {
			theme: "dracula",
			wrap: true,
		},
	},
	integrations: [
		mdx({}),
		tailwind({
			applyBaseStyles: false,
		}),
		sitemap(),
		icon(),
		NetlifyCMS({
			config: {
				// Use Netlify’s “Git Gateway” authentication and target our default branch
				backend: {
					name: "git-gateway",
					branch: "latest",
				},
				// Configure where our media assets are stored & served from
				media_folder: "public/assets/blog",
				public_folder: "public/assets/blog",
				// Configure the content collections
				collections: [
					{
						name: "posts",
						label: "Blog Posts",
						label_singular: "Blog Post",
						folder: "src/content/post",
						create: true,
						delete: true,
						nested: { depth: 100 },
						meta: { path: { label: "path", widget: "string", index_file: "index" } },
						fields: [
							{ name: "title", widget: "string", label: "Post Title" },
							{ name: "description", widget: "string", label: "Post Description" },

							{
								name: "publishDate",
								widget: "datetime",
								format: "DD MMM YYYY",
								date_format: "DD MMM YYYY",
								time_format: false,
								label: "Publish Date",
							},
							{
								name: "updatedDate",
								widget: "datetime",
								format: "DD MMM YYYY",
								date_format: "DD MMM YYYY",
								time_format: false,
								label: "Updated Date",
								required: false,
							},
							{ name: "draft", widget: "boolean", label: "draft", required: false },
							{
								name: "coverImage",
								widget: "object",
								fields: [
									{ name: "src", widget: "image", label: "src", required: false },
									{ name: "alt", widget: "string", label: "alt", required: false },
								],
								label: "coverImage",
								required: false,
							},
							{ name: "tags", widget: "string", label: "tags", required: false },
							{ name: "ogImage", widget: "string", label: "ogImage", required: false },
							{ name: "body", widget: "markdown", label: "Post Body" },
						],
					},
				],
			},
			previewStyles: ["/src/styles/blog.css"],
		}),
	],
	image: {
		domains: ["webmention.io"],
	},
	// https://docs.astro.build/en/guides/prefetch/
	prefetch: true,
	vite: {
		plugins: [rawFonts([".ttf"])],
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
	},
});

function rawFonts(ext: Array<string>) {
	return {
		name: "vite-plugin-raw-fonts",
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore:next-line
		transform(_, id) {
			if (ext.some((e) => id.endsWith(e))) {
				const buffer = fs.readFileSync(id);
				return {
					code: `export default ${JSON.stringify(buffer)}`,
					map: null,
				};
			}
		},
	};
}
