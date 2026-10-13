import PublicHeader from "@/app/public-header";
import { briefAnchor, briefBlocks, briefContents, designBriefDate, designBriefMinutes } from "@/lib/design-brief";
import { briefInlineParts, parseBriefBlock } from "@/lib/brief-format";
import BriefActions from "./print";
import "./design-brief.css";


// React escapes all prose. Only the document's supported formatting is rendered.
function Prose({ text }: { text: string }) {
  return <>{briefInlineParts(text).map((part, index) => part.kind === "link"
    ? <a key={index} href={part.href} target="_blank" rel="noreferrer">{part.text}</a>
    : part.kind === "strong" ? <strong key={index}>{part.text}</strong> : part.text)}</>;
}

export default function DesignBriefPage() {
  return <main className="local-page brief-page" id="brief-top">
    <PublicHeader brief />
    <div className="local-frame">
      <header className="brief-heading">
        <a className="brief-back" href="/local-models">Back to the configuration explorer</a>
        <p className="local-kicker">LOCAL MODEL GUIDE · README</p>
        <h1>Design Brief</h1>
        <p className="brief-deck">What each choice gives you, why it is here, and how the pieces work together.</p>
        <div className="brief-meta"><span>Updated {designBriefDate}</span><span>About {designBriefMinutes} minutes</span></div>
        <BriefActions />
      </header>
      <div className="brief-layout">
        <nav className="brief-contents" aria-label="Design Brief sections"><h2>In this brief</h2><ol>{briefContents.map((item) => <li key={item.id}><a href={"#" + item.id}>{item.title}</a></li>)}</ol></nav>
        <article className="brief-prose" aria-label="Local Model Guide design explanation">
          {briefBlocks.map(parseBriefBlock).map((block, index) => {
            if (block.kind === "heading") {
              if (block.level === 1) return null;
              return block.level === 2
                ? <h2 id={briefAnchor(block.text)} key={index}>{block.text}</h2>
                : <h3 key={index}>{block.text}</h3>;
            }
            if (block.kind === "list") return <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}><Prose text={item} /></li>)}</ul>;
            return <p key={index}><Prose text={block.text} /></p>;
          })}
          <footer className="brief-end"><a href="/local-models">Explore a configuration</a><a href="#brief-top">Back to the top</a></footer>
        </article>
      </div>
    </div>
  </main>;
}
