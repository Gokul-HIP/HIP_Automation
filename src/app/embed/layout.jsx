/**
 * Minimal shell for Laravel Admin iframe embeds — no dashboard chrome.
 */
export default function EmbedLayout({ children }) {
  return (
    <div
      data-embed-shell="true"
      style={{
        minHeight: "100%",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; }
        #__next, [data-embed-shell="true"] { height: 100%; }
      `}</style>
      {children}
    </div>
  );
}
