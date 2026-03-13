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

function normalizeImageUrl(url: string | undefined) {
  if (!url || typeof url !== "string") {
    return FALLBACK_IMAGE;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return FALLBACK_IMAGE;
  }

  // Social crawlers prefer absolute https URLs.
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("http://")) {
    return trimmed.replace("http://", "https://");
  }

  if (trimmed.startsWith("https://")) {
    // AVIF is not reliably supported by social crawlers (Facebook/Discord/X).
    if (trimmed.toLowerCase().endsWith(".avif")) {
      return FALLBACK_IMAGE;
    }
    return trimmed;
  }

  // Relative URL fallback to site domain.
  if (trimmed.startsWith("/")) {
    return `${SITE_URL}${trimmed}`;
  }

  return FALLBACK_IMAGE;
}

function getImageMimeType(url: string) {
  const lower = url.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function injectMetaIntoHtml(
  html: string,
  title: string,
  description: string,
  metaTags: string,
) {
  let updated = html;

  if (/<title[\s\S]*?<\/title>/i.test(updated)) {
    updated = updated.replace(/<title[\s\S]*?<\/title>/i, `<title>${escapeAttr(title)}</title>`);
  }

  if (/name=["']description["']/i.test(updated)) {
    updated = updated.replace(
      /<meta[^>]*name=["']description["'][^>]*>/i,
      `<meta name="description" content="${escapeAttr(description)}">`,
    );
  }

  if (/<\/head>/i.test(updated)) {
    updated = updated.replace(/<\/head>/i, `${metaTags}\n</head>`);
  }

  return updated;
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

    const title = (post.title?.rendered || "Fenty.no").trim();
    const description = stripHtml(
      post.excerpt?.rendered ||
        "Her finner du blog innlegg om Rihannas varemerker og lanseringer, i tillegg til nyheter om Rihanna",
    );
    const featuredImage = normalizeImageUrl(
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
    );
    const imageType = getImageMimeType(featuredImage);
    const canonicalUrl = `${SITE_URL}/posts/${post.slug}/`;

    const metaTags = `
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Fenty.no">
    <meta property="og:title" content="${escapeAttr(title)}">
    <meta property="og:description" content="${escapeAttr(description)}">
    <meta property="og:image" content="${escapeAttr(featuredImage)}">
    <meta property="og:image:secure_url" content="${escapeAttr(featuredImage)}">
    <meta property="og:image:type" content="${escapeAttr(imageType)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${escapeAttr(canonicalUrl)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeAttr(title)}">
    <meta name="twitter:description" content="${escapeAttr(description)}">
    <meta name="twitter:image" content="${escapeAttr(featuredImage)}">
    <link rel="canonical" href="${escapeAttr(canonicalUrl)}">
  `;

    if (typeof HTMLRewriter === "undefined") {
      const html = await baseResponse.text();
      const injectedHtml = injectMetaIntoHtml(html, title, description, metaTags);
      const fallbackResponse = new Response(injectedHtml, {
        status: baseResponse.status,
        statusText: baseResponse.statusText,
        headers: baseResponse.headers,
      });
      fallbackResponse.headers.set("x-og-edge-status", "injected-fallback");
      fallbackResponse.headers.set("content-type", "text/html; charset=UTF-8");
      return fallbackResponse;
    }

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
