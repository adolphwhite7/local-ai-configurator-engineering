import LocalModelsPage from "./app/local-models/page";
import DesignBriefPage from "./app/local-models/design-brief/page";

export default function App() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path === "/local-models/design-brief") return <DesignBriefPage />;
  if (path === "/" || path === "/local-models") return <LocalModelsPage />;
  return <main className="local-page"><div className="local-frame public-not-found">
    <h1>Page not found</h1><p><a href="/">Open the Local Model Guide</a></p>
  </div></main>;
}
