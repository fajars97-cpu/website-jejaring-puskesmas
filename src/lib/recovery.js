export function isRecoveryUrl(href) {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  return url.searchParams.get("recovery") === "1" || hash.get("type") === "recovery";
}

export function recoveryDestination(href) {
  const url = new URL(href);
  url.searchParams.delete("recovery");
  url.hash = "/reset-password";
  return `${url.pathname}${url.search}${url.hash}`;
}
