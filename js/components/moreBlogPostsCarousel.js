import { getPosts } from "../utils/posts.js";
import { FENTY_EMBED_API_URL } from "../fetchAPI/embedAPI.js";

const queryString = document.location.search;
export const params = new URLSearchParams(queryString);
export const id = params.get("id");
const blogPostCarousel = document.querySelector(
  ".more-blog-posts-carousel-cards",
);

export async function renderBlogCarousel() {
  try {
    const postinfo = await getPosts(FENTY_EMBED_API_URL);
    blogPostCarousel.innerHTML = "";
    postinfo.slice(0, 4).forEach((post) => {
      if (post.id != id) {
        const blogPostCard = createCategoryBlogPost(post);
        blogPostCarousel.appendChild(blogPostCard);
      }
    });
  } catch (error) {
    console.error(`Error ved henting av flere innlegg:`, error);
    blogPostCarousel.innerHTML = `<div class="error">Beklager, en feil oppsto mens innleggene skulle lastes inn.</div>`;
  }
}

export function createCategoryBlogPost(post) {
  const carousel = document.createElement(`div`);
  carousel.classList.add(`new-blog-post-carousel-card`);
  carousel.dataset.postId = post.id;
  const featuredMedia =
    post._embedded["wp:featuredmedia"] &&
    post._embedded["wp:featuredmedia"][0] &&
    post._embedded["wp:featuredmedia"][0].source_url;
  const imageUrl = featuredMedia || "/img/RIHANNAnm.jpg";
  const featuredMediaAlt =
    post._embedded["wp:featuredmedia"] &&
    post._embedded["wp:featuredmedia"][0] &&
    post._embedded["wp:featuredmedia"][0].alt_text;
  const imageAltText = featuredMediaAlt || `missing alt text`;

  carousel.innerHTML += `<a href="/single-post/?id=${post.id}">
                                <img src="${imageUrl}" class="category-img" alt="${imageAltText}">
                                <h4>${post.title.rendered}</h4>
                                </a>`;

  return carousel;
}
