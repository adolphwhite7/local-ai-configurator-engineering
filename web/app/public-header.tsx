export default function PublicHeader({ brief = false }: { brief?: boolean }) {
  return <header className="folio-header local-header">
    <a className="folio-wordmark" href="/" aria-label="Local Model Guide home"><strong>Local Model Guide</strong></a>
    <nav aria-label="Local Model Guide">
      <a className={brief ? "" : "active"} aria-current={brief ? undefined : "page"} href="/">Configurator</a>
      <a className={brief ? "active" : ""} aria-current={brief ? "page" : undefined} href="/local-models/design-brief">Design Brief</a>
    </nav>
  </header>;
}
