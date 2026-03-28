import { useEffect } from "react";

interface PageMeta {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogUrl?: string;
  canonicalPath?: string;
}

function setMetaTag(property: string, content: string, isName = false) {
  const attr = isName ? "name" : "property";
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (el) {
    el.content = content;
  } else {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    el.content = content;
    document.head.appendChild(el);
  }
}

function setCanonical(path: string) {
  const url = `${window.location.origin}${path}`;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (link) {
    link.href = url;
  } else {
    link = document.createElement("link");
    link.rel = "canonical";
    link.href = url;
    document.head.appendChild(link);
  }
  return url;
}

const DEFAULT_TITLE = "The Page Gallery Journal";
const DEFAULT_DESC = "A Room for Writing. You don't submit. You don't query. You just write.";

export function usePageMeta({ title, description, ogTitle, ogDescription, ogType, ogUrl, canonicalPath }: PageMeta) {
  useEffect(() => {
    const fullTitle = title === DEFAULT_TITLE ? title : `${title} \u2014 ${DEFAULT_TITLE}`;
    document.title = fullTitle;
    setMetaTag("description", description, true);
    setMetaTag("og:title", ogTitle || fullTitle);
    setMetaTag("og:description", ogDescription || description);
    if (ogType) setMetaTag("og:type", ogType);
    const resolvedUrl = ogUrl
      ? (ogUrl.startsWith("http") ? ogUrl : `${window.location.origin}${ogUrl}`)
      : canonicalPath
        ? `${window.location.origin}${canonicalPath}`
        : window.location.href;
    setMetaTag("og:url", resolvedUrl);
    setMetaTag("twitter:title", ogTitle || fullTitle);
    setMetaTag("twitter:description", ogDescription || description);
    if (canonicalPath) setCanonical(canonicalPath);
    return () => {
      document.title = DEFAULT_TITLE;
      setMetaTag("description", DEFAULT_DESC, true);
      setMetaTag("og:title", DEFAULT_TITLE);
      setMetaTag("og:description", DEFAULT_DESC);
      setMetaTag("og:type", "website");
      setMetaTag("og:url", window.location.origin);
      setMetaTag("twitter:title", DEFAULT_TITLE);
      setMetaTag("twitter:description", DEFAULT_DESC);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.remove();
    };
  }, [title, description, ogTitle, ogDescription, ogType, ogUrl, canonicalPath]);
}
