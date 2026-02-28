const footerMarkup = `
  <footer>
    <div class="footer-content">
      <div class="left-footer">
        <div class="footer-menu">
          <p>Kjøp Fenty fra butikker uten toll:</p>
          <ul>
            <li><a href="https://fredrikoglouisa.no/sokeresultater/?searchterm=fenty" target="_blank">Fredrikoglouisa.no</a></li>
            <li><a href="https://www.sephora.se/sok/?q=fenty" target="_blank">Sephora.se</a></li>
            <li><a href="https://eu.puma.com/no/en/fenty-x-puma" target="_blank">eu.Puma.com</a></li>
            <li><a href="https://fentybeauty.com" target="_blank">Fentybeauty.com</a></li>
          </ul>
        </div>
      </div>
      <div class="center-footer">
        <div class="copyright">
          <p>Copyright Fenty.no 2026</p>
          <p>All Rights Reserved</p>
        </div>
      </div>
      <div class="right-footer">
        <ul>
          <li><a href="/fenty-beauty/">Om Fenty Beauty</a></li>
          <li><a href="/fenty-skin/">Om Fenty Skin</a></li>
          <li><a href="/savage-x/">Om SavageX</a></li>
          <li><a href="/privacy-policy/">Personvernerklæring</a></li>
        </ul>
      </div>
    </div>
  </footer>
`;

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.outerHTML = footerMarkup;
  }
}

if (!customElements.get("site-footer")) {
  customElements.define("site-footer", SiteFooter);
}
