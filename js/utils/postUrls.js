function isLocalhostHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function getPostUrl(postId, postSlug) {
  const hostname = window.location.hostname;
  const useLegacyUrl = isLocalhostHost(hostname);

  if (useLegacyUrl || !postSlug) {
    return `/single-post/?id=${postId}`;
  }

  return `/posts/${postSlug}/`;
}
