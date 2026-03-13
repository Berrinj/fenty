import "./components/footerComponent.js";

const nav = document.querySelector(".main-menu");
const hamburgerMenu = document.querySelector(".hamburger-menu");
// import * as getPosts from "./fetchAPI/getPost.js";

if (hamburgerMenu && nav) {
  hamburgerMenu.addEventListener("click", hamburgerMenuClick);
}

export function hamburgerMenuClick() {
  nav.classList.toggle("active");
}

switch (window.location.pathname) {
  case "/index.html":
  case "/":
    // getPosts.renderBlogPosts();
    import("./fetchAPI/getPost.js");
    break;
  case "/contact":
  case "/contact/":
    import("../js/Pages.js/contact.js").then((module) => {});
    break;
  case "/category":
  case "/category/":
    import("../js/Pages.js/category.js").then((module) => {});
    break;
  case "/single-post":
  case "/single-post/":
    import("../js/Pages.js/singlePost.js").then((module) => {});
    break;
  default:
    if (window.location.pathname.startsWith("/posts/")) {
      import("../js/Pages.js/singlePost.js").then((module) => {});
    }
}
