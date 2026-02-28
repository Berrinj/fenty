import "./components/footerComponent.js";

const nav = document.querySelector(".main-menu");
const hamburgerMenu = document.querySelector(".hamburger-menu");
// import * as getPosts from "./fetchAPI/getPost.js";

hamburgerMenu.addEventListener("click", hamburgerMenuClick);

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
  case "/about":
  case "/about/":
    import("../js/Pages.js/category.js").then((module) => {});
    break;
  case "/discography":
  case "/discography/":
    import("../js/Pages.js/category.js").then((module) => {});
    break;
  case "/fenty-beauty":
  case "/fenty-beauty/":
    import("../js/Pages.js/category.js").then((module) => {});
    break;
  case "/fenty-skin":
  case "/fenty-skin/":
    import("../js/Pages.js/category.js").then((module) => {});
    break;
  case "/savage-x":
  case "/savage-x/":
    import("../js/Pages.js/category.js").then((module) => {});
    break;
  case "/privacy-policy":
  case "/privacy-policy/":
    import("../js/Pages.js/category.js").then((module) => {});
    break;
  default:
}
