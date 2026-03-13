const WP_POSTS_API = "https://wp.fenty.no/wp-json/wp/v2/posts";
const SITE_URL = "https://www.fenty.no";
const FALLBACK_IMAGE = `${SITE_URL}/img/RIHANNAnm.jpg`;

declare const HTMLRewriter: any;

type WpPost = {
  id: number;
  slug: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  _embedded?: {
    [key: string]: Array<{ source_url?: string }>;
  };
};

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function getPostById(id: string): Promise<WpPost | null> {
  const response = await fetch(`${WP_POSTS_API}/${id}?_embed`);
  if (!response.ok) {
    return null;
  }

  const post = (await response.json()) as WpPost;
  return post?.id ? post : null;
}

async function getPostBySlug(slug: string): Promise<WpPost | null> {
  const response = await fetch(
    `${WP_POSTS_API}?slug=${encodeURIComponent(slug)}&_embed`,
  );

  if (!response.ok) {
    return null;
  }

  const posts = (await response.json()) as WpPost[];
  if (!Array.isArray(posts) || posts.length === 0) {
    return null;
  }

  return posts[0];
}

async function resolvePost(url: URL): Promise<WpPost | null> {
  const id = url.searchParams.get("id");
  if (id) {
    const byId = await getPostById(id);
    if (byId) {
      return byId;
    }
  }

  const slugParam = url.searchParams.get("slug");
  if (slugParam) {
    return getPostBySlug(slugParam);
  }

  const slugMatch = url.pathname.match(/^\/posts\/([^/]+)\/?$/);
  if (!slugMatch) {
    return null;
  }

  let slug = "";
  try {
    slug = decodeURIComponent(slugMatch[1]);
  } catch {
    return null;
  }

  return getPostBySlug(slug);
}

export default async (request: Request, context: any) => {
  const response = await context.next();
  const baseResponse = new Response(response.body, response);
  baseResponse.headers.set("x-og-edge", "hit");

  try {
    const url = new URL(request.url);
    const post = await resolvePost(url);
    const contentType = baseResponse.headers.get("content-type") || "";

    if (!post || !contentType.includes("text/html")) {
      baseResponse.headers.set("x-og-edge-status", post ? "not-html" : "no-post");
      return baseResponse;
    }

    if (typeof HTMLRewriter === "undefined") {
      baseResponse.headers.set("x-og-edge-status", "no-htmlrewriter");
      return baseResponse;
    }

    const title = (post.title?.rendered || "Fenty.no").trim();
    const description = stripHtml(
      post.excerpt?.rendered ||
        "Her finner du blog innlegg om Rihannas varemerker og lanseringer, i tillegg til nyheter om Rihanna",
    );
    const featuredImage =
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || FALLBACK_IMAGE;
    const canonicalUrl = `${SITE_URL}/posts/${post.slug}/`;

    const metaTags = `
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Fenty.no">
    <meta property="og:title" content="${escapeAttr(title)}">
    <meta property="og:description" content="${escapeAttr(description)}">
    <meta property="og:image" content="${escapeAttr(featuredImage)}">
    <meta property="og:url" content="${escapeAttr(canonicalUrl)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeAttr(title)}">
    <meta name="twitter:description" content="${escapeAttr(description)}">
    <meta name="twitter:image" content="${escapeAttr(featuredImage)}">
    <link rel="canonical" href="${escapeAttr(canonicalUrl)}">
  `;

    const transformed = new HTMLRewriter()
      .on("head > title", {
        element(element: any) {
          element.setInnerContent(title);
        },
      })
      .on('head > meta[name="description"]', {
        element(element: any) {
          element.setAttribute("content", description);
        },
      })
      .on("head", {
        element(element: any) {
          element.append(metaTags, { html: true });
        },
      })
      .transform(baseResponse);

    transformed.headers.set("x-og-edge-status", "injected");
    return transformed;
  } catch (error) {
    console.error("post-og edge error:", error);
    baseResponse.headers.set("x-og-edge-status", "error");
    return baseResponse;
  }
};
