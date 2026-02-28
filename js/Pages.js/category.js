import { FENTY_EMBED_API_URL } from "../fetchAPI/embedAPI.js";
import { getPosts } from "../utils/posts.js";

const queryString = document.location.search;
export const params = new URLSearchParams(queryString);
export const categoryId = params.get("id");
const categoryName = params.get("categoryName");
document.title = `Fenty - Kategori - ${categoryName}`;

const categoryNameHeader = document.querySelector(".news-and-content");
if (categoryNameHeader) {
  categoryNameHeader.innerHTML += `${categoryName}`;
}

const blogPostContainer = document.querySelector(
  ".blog-posts-category-container",
);

async function renderPostByCategoryCard() {
  if (!blogPostContainer || !categoryId) {
    return; // Exit if not on a category page
  }
  const getCategoryData = await getPosts(
    `${FENTY_EMBED_API_URL}&categories=${categoryId}`,
  );
  blogPostContainer.innerHTML = "";
  getCategoryData.forEach((post) => {
    const blogPostCard = createCategoryBlogPost(post);
    blogPostContainer.appendChild(blogPostCard);
  });
}

function createCategoryBlogPost(post) {
  const blogPostCard = document.createElement(`div`);
  blogPostCard.dataset.postId = post.id;
  blogPostCard.classList.add(`blog-post-container`);
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

  const textMaxLength = 90;

  blogPostCard.innerHTML += `<a href="/single-post/?id=${post.id}">
    <div class="blog-posts-category-card">
                                <img src="${imageUrl}" class="category-img" alt="${imageAltText}">
                                <h2>${post.title.rendered}</h2>
                                ${truncateText(post.excerpt.rendered, textMaxLength)}
                                </div>
                                </a>`;

  function truncateText(text, maxLength) {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  }
  return blogPostCard;
}

if (blogPostContainer && categoryId) {
  renderPostByCategoryCard();
}
