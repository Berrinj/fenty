import { FENTY_CATEGORY_API_URL } from "../fetchAPI/categoriesAPI.js";
import { getCategories } from "../utils/categories.js";
import { FENTY_COMMENTS_API_URL } from "../fetchAPI/commentsAPI.js";
import { FENTY_API_URL } from "../fetchAPI/baseAPI.js";
import { getPosts } from "./posts.js";
import { dataFromContentRendered } from "./reverseEngineerContentRendered.js";
import { getComments } from "./comments.js";

const queryString = document.location.search;
export const params = new URLSearchParams(queryString);
export const id = params.get("id");

const url = `${FENTY_API_URL}/${id}?_embed`;

const main = document.querySelector("main");
const mainContainer = document.querySelector(".single-blogpost-container");
const contentContainer = document.querySelector(".single-blogpost-content");
const singleBlogPostContainer = document.querySelector(
  ".single-blogpost-container",
);

export async function getSinglePost() {
  try {
    const response = await fetch(url);
    const result = await response.json();
    contentContainer.innerHTML = ``;
    document.title = `Fenty - Blog innlegg: ${result.title.rendered}`;
    const featuredMedia =
      result._embedded["wp:featuredmedia"] &&
      result._embedded["wp:featuredmedia"][0] &&
      result._embedded["wp:featuredmedia"][0].source_url;
    const imageUrl = featuredMedia || "/img/RIHANNAnm.jpg";
    const featuredMediaAlt =
      result._embedded["wp:featuredmedia"] &&
      result._embedded["wp:featuredmedia"][0] &&
      result._embedded["wp:featuredmedia"][0].alt_text;
    const imageAltText = featuredMediaAlt || `missing alt text`;

    const categoriesList = await getCategories(
      `${FENTY_CATEGORY_API_URL}?post=${id}`,
    );
    const categoryName =
      categoriesList.length > 0 ? categoriesList[0].name : "Uncategorized";
    const categoryURL = categoriesList[0].link;
    const categoryId =
      categoriesList.length > 0 ? categoriesList[0].id : `Undefined`;

    const formattedDate = new Date(result.date).toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formattedTime = new Date(result.date).toLocaleTimeString("nb-NO", {
      hour: "numeric",
      minute: "numeric",
    });

    contentContainer.innerHTML = `<img class="main-post-img" src="${imageUrl}" alt="${imageAltText}">
                                <div class="breadcrumbs">
                                    <p><a href="index.html">Hjem</a></p> / <p>${result.title.rendered}</p>
                                </div>
                                <h1>${result.title.rendered}</h1>
                                <div class="single-blog-post-info">
                                    <div class="author">
                                        <p><i class="fa-solid fa-pencil fa-2xs" style="color: #35423A;"></i> ${result._embedded.author[0].name}</p>
                                    </div>
                                    <div class="dateandtime">
                                        <p><i class="fa-regular fa-clock fa-2xs" style="color: #35423A;"></i> ${formattedDate} ${formattedTime}</p>
                                    </div>
                                    
                                </div>
                                <div class="single-blog-post-text">
                                    ${result.content.rendered}
                                </div>
                                <div class="gallery"></div>
                                <div class="category">
                                <p>Kategori: <a href="/category/?id=${categoryId}&categoryName=${categoryName}">${categoryName}</a></p>
                                </div>
                                <div id="go-back" onclick="history.back()">&larr; Gå tilbake</div>`;

    await modalClick();
    galleryClassList();
  } catch (error) {
    singleBlogPostContainer.innerHTML = `<div class="error">Beklager, en feil oppsto mens innlegget skulle lastes inn. <a href="javascript:history.back()">Gå tilbake</a></div>`;
    throw error;
  }
}

function openModal(src, alt) {
  const dialog = document.querySelector("dialog");
  dialog.innerHTML = "";
  const fullSizeImage = document.createElement("img");
  fullSizeImage.src = src;
  fullSizeImage.alt = alt;

  dialog.appendChild(fullSizeImage);
  dialog.showModal();

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  fullSizeImage.addEventListener("click", () => {
    dialog.close();
  });
}

async function modalClick() {
  const imagesAPI = await getPosts(`${FENTY_API_URL}/${id}/?_embed`);
  const imgData = dataFromContentRendered(imagesAPI.content.rendered);

  const galleryContainer = document.querySelector(".wp-block-gallery");
  const singleImage = document.querySelector(`.wp-block-image`);

  const handleClick = (event) => {
    const img = event.target.closest("img");

    if (img && event.target === img) {
      const src = img.getAttribute("src");
      const alt = img.getAttribute("alt");
      openModal(src, alt);
    }
  };

  if (galleryContainer) {
    galleryContainer.addEventListener("click", handleClick);
  }

  if (singleImage) {
    singleImage.addEventListener("click", handleClick);
  }
}

function galleryClassList() {
  const gallery = document.querySelectorAll(".wp-block-image");
  gallery.forEach((img) => {
    img.classList.add("single-post-gallery");
  });
}

const commentForm = document.getElementById("comment-form");
document.addEventListener("DOMContentLoaded", function () {
  commentForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleCommentSubmitted();
  });
});

function handleCommentSubmitted() {
  const username = document.querySelector("#username");
  const email = document.querySelector("#email");
  const comment = document.querySelector("#comment");

  if (validateInputs(username, email, comment)) {
    const usernameValue = document.querySelector("#username").value;
    const emailValue = document.querySelector("#email").value;
    const commentValue = document.querySelector("#comment").value;
    const commentData = {
      post: id,
      author_name: usernameValue,
      content: commentValue,
      author_email: emailValue,
    };
    console.log(commentData);
    commentForm.reset();
    submitCommentToWordPress(commentData);
  }
}
const isEmailValid = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const setError = (element, message) => {
  const inputControl = element.parentElement;
  const errorMessage = inputControl.querySelector(".form-error");
  errorMessage.innerText = message;
};

const setSuccess = (element) => {
  const inputControl = element.parentElement;
  const errorMessage = inputControl.querySelector(".form-error");

  errorMessage.innerText = "";
  inputControl.classList.add("success");
  inputControl.classList.remove("form-error");
};

function validateInputs(username, email, comment) {
  let isValid = true;
  const usernameTrim = username.value.trim();
  const emailValue = email.value.trim();
  const commentTrim = comment.value.trim();

  if (usernameTrim.length < 3) {
    setError(username, "Navnet må være på 3 eller flere karakterer");
    isValid = false;
  } else {
    setSuccess(username);
  }

  if (emailValue === "") {
    setError(email, "Email er påkrevd");
    isValid = false;
  } else if (!isEmailValid(emailValue)) {
    setError(email, "Skriv inn en ekte email adresse");
    isValid = false;
  } else {
    setSuccess(email);
  }

  if (commentTrim.length < 4) {
    setError(comment, "Kommentaren kan ikke være under 4 karakterer");
    isValid = false;
  } else {
    setSuccess(comment);
  }
  return isValid;
}

const commentContent = document.querySelector(".comment-content");
const noComment = document.querySelector(".no-comments");

async function fetchCommentsAndUpdateUI() {
  const comments = await getComments(`${FENTY_COMMENTS_API_URL}?post=${id}`);

  updateCommentSection(comments);
}

function updateCommentSection(comments) {
  commentContent.innerHTML = "";

  if (comments.length === 0) {
    noComment.innerHTML = "Ingen kommentarer, vær den første!";
  }

  const commentsHeader = document.querySelector(".comments h4");
  commentsHeader.innerHTML = `Kommentarer (${comments.length})`;

  comments.forEach((comment) => {
    const formattedDate = new Date(comment.date).toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formattedTime = new Date(comment.date).toLocaleTimeString("nb-NO", {
      hour: "numeric",
      minute: "numeric",
    });

    commentContent.innerHTML += `<div class="comment-card">
                                    <img class="commenter-avatar" src="${comment.author_avatar_urls[48]}">
                                    <div class="commenter-name">${comment.author_name}</div>
                                    <div class="comment-posted">${comment.content.rendered}</div>
                                    <div class="comment-date">${formattedDate} ${formattedTime}</div>
                                </div>`;
  });
}

async function displayComments() {
  try {
    const comments = await getComments(`${FENTY_COMMENTS_API_URL}?post=${id}`);

    if (comments.length === 0) {
      noComment.innerHTML = "Ingen kommentarer, vær den første!";
    }

    const commentsHeader = document.querySelector(".comments h4");
    commentsHeader.innerHTML += ` (${comments.length})`;

    comments.forEach((comment) => {
      const formattedDate = new Date(comment.date).toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const formattedTime = new Date(comment.date).toLocaleTimeString("nb-NO", {
        hour: "numeric",
        minute: "numeric",
      });

      commentContent.innerHTML += `<div class="comment-card">
                                    <img class="commenter-avatar" src="${comment.author_avatar_urls[48]}">
                                    <div class="commenter-name">${comment.author_name}</div>
                                    <div class="comment-posted">${comment.content.rendered}</div>
                                    <div class="comment-date">${formattedDate} ${formattedTime}</div
                                    </div>`;
    });
  } catch (error) {
    commentContent.innerHTML = `<div class="error">En feil oppsto ved innlasting av kommentarer</div>`;
  }
}

displayComments();

const endpointURL = `https://wp.fenty.no/wp-json/wp/v2/comments?post=${id}`;
const commentOnHold = document.querySelector(".comment-on-hold");

function submitCommentToWordPress(commentData) {
  fetch(endpointURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commentData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.status === `hold`) {
        commentOnHold.innerHTML = `Kommentaren din er til godkjenning.`;
      } else {
        commentOnHold.innerHTML = "";
      }
      fetchCommentsAndUpdateUI();
    })
    .catch((error) => {
      console.error("En feil oppsto ved posting av kommentar:", error);
    });
}
