import { example } from "./reverseEngineerContentRendered.js";
import { getCategories } from "./categories.js";
import { FENTY_CATEGORY_API_URL } from "../fetchAPI/categoriesAPI.js";
import { getComments } from "./comments.js";
import { FENTY_COMMENTS_API_URL } from "../fetchAPI/commentsAPI.js";
const main = document.querySelector("main");
const blogContent = document.querySelector(".blog-content");

export function createBlogPost(post) {
  try {
    const blogPostCard = document.createElement(`div`);
    blogPostCard.dataset.postId = post.id;
    blogPostCard.classList.add(`blog-post`);
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

    const formattedDate = new Date(post.date).toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    async function renderBlogPostInfo() {
      try {
        const commentsData = await getComments(
          `${FENTY_COMMENTS_API_URL}?post=${post.id}`,
        );
        const categoriesList = await getCategories(
          `${FENTY_CATEGORY_API_URL}?post=${post.id}`,
        );
        const categoryName =
          categoriesList.length > 0 ? categoriesList[0].name : "Ukategorisert";
        const categoryId =
          categoriesList.length > 0 ? categoriesList[0].id : `Undefinert`;

        if (main) {
          blogPostCard.innerHTML = `<div class="blog-post-header">
                                    <div class="blog-date">
                                        <h4>${formattedDate}</h4>
                                    </div>
                                    <div class="blog-post-header-img">
                                        <img src="/img/post-top-image.png" alt="Rihannas øyne">
                                    </div>
                                </div>
                                
                                <div class="blog-post-content">
                                    <div class="blog-post-img-title">
                                    <a href="/single-post/?id=${post.id}">
                                        <img class="blog-post-main-img" src="${imageUrl}" alt="${imageAltText}">
                                        <h1 class="blog-post-title">${post.title.rendered}</h1></a>
                                    </div>
                                    <div class="blog-post-text">
                                    ${post.excerpt.rendered}
                                    </div>
                                    <div id="read-more"><a href="/single-post/?id=${post.id}">Les mer.. &rarr;</a></div>
                                </div>
                                <div class="blog-post-info">
                                    <div class="author">
                                        <p>Av: ${post._embedded.author[0].name} i <a href="/category/?id=${categoryId}&categoryName=${categoryName}">${categoryName}</a></p>
                                    </div>
                                    <div class="dateandtime">
                                        <p>Kommentarer: ${commentsData.length}</p>
                                    </div>
                                </div>
                        `;
        }
      } catch (error) {
        blogContent.innerHTML = `<div class="error">Beklager, en feil oppsto ved innlasting av innhold</div>`;
      }
    }

    renderBlogPostInfo();

    return blogPostCard;
  } catch (error) {
    if (main) {
      blogContent.innerHTML = `<div class="error">Beklager, en feil oppsto ved innlasting av innhold</div>`;
    }
    return null;
  }
}

example();
