import { FENTY_EMBED_API_URL } from "../fetchAPI/embedAPI.js";
import { getPosts } from "./posts.js";

let currentPostIndex = 0;
let displayPost;
const leftArrow = document.querySelector(".left-arrow");
const rightArrow = document.querySelector(".right-arrow");
const postCarousel = document.querySelector(".new-blog-post-carousel");

export async function renderPostCarousel() {
    try {
    
    displayPost = await getPosts(`${FENTY_EMBED_API_URL}&per_page=5`);
    postCarousel.innerHTML = "";
    const featuredMedia = displayPost[currentPostIndex]._embedded['wp:featuredmedia'] && displayPost[currentPostIndex]._embedded['wp:featuredmedia'][0] && displayPost[currentPostIndex]._embedded['wp:featuredmedia'][0].source_url;
    const imageUrl = featuredMedia || '/img/RIHANNAnm.jpg';
    const featuredMediaAlt = displayPost[currentPostIndex]._embedded['wp:featuredmedia'] && displayPost[currentPostIndex]._embedded['wp:featuredmedia'][0] && displayPost[currentPostIndex]._embedded['wp:featuredmedia'][0].alt_text;
    const imageAltText = featuredMediaAlt || `missing alt text`;
    postCarousel.innerHTML = `<a href="/single-post/?id=${displayPost[currentPostIndex].id}"><img class="carousel-img" src="${imageUrl}" alt="${imageAltText}"> <p class="carousel-text">${displayPost[currentPostIndex].title.rendered}</p>`

    updateArrowButtonStates();
} catch (error) {
    postCarousel.innerHTML = `<div class="error">En feil oppsto ved innlasting av innleggene</div>`;
    throw error;
}
}

export function handleRightArrow() {
    if (currentPostIndex < displayPost.length - 1) {
        currentPostIndex++;
        renderPostCarousel();
    } else {
        
    }
}

export function handleLeftArrow() {
    if (currentPostIndex > 0) {
        currentPostIndex--;
    } else {
        currentPostIndex = 0;
    }
    renderPostCarousel();
}

export function updateArrowButtonStates() {
    leftArrow.classList.toggle('disabled-arrow', currentPostIndex === 0);
    rightArrow.classList.toggle('disabled-arrow', currentPostIndex === displayPost.length - 1);
}

rightArrow.addEventListener("click", handleRightArrow);
leftArrow.addEventListener("click", handleLeftArrow);
