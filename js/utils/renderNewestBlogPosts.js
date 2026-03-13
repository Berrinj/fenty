import { FENTY_EMBED_API_URL } from "../fetchAPI/embedAPI.js";
import { getPosts } from "./posts.js";
import { getPostUrl } from "./postUrls.js";
const loader = document.querySelector(".posts-loader");

const newestBlogPostSection = document.querySelector(".new-blog-post-list ul");

export async function renderNewestBlogPosts() {
  try {
    loader.style.display = "none";
    let newPostList = await getPosts(FENTY_EMBED_API_URL);
    console.log(newPostList);
    const postItemsHTML = newPostList.slice(0, 8).map((newPostItem) => {
      const postUrl = getPostUrl(newPostItem.id, newPostItem.slug);
      return `<li><a href="${postUrl}">${newPostItem.title.rendered}<p class="go-to-post">Les mer..</p></li></a></li>`;
    });

    newestBlogPostSection.innerHTML = postItemsHTML.join("");
  } catch (error) {
    newestBlogPostSection.innerHTML = `<div class="error">En feil oppsto ved henting av nye innlegg</div>`;
    console.error("En feil oppsto:", error);
    throw error;
  }
}
