// Shared presentational primitives for the long-form editorial content that wraps
// each GPU tool. Keeps the design consistent across tools while each tool supplies
// its own unique copy. Server components — no client JS.

export function FaqSchema({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ContentCard({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({ children }) {
  return <h2 className="text-2xl font-black tracking-tight text-gray-900">{children}</h2>;
}

export function Prose({ children }) {
  return <p className="mt-4 text-sm leading-7 text-gray-600">{children}</p>;
}

export function InfoTile({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <h3 className="text-base font-black text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-gray-600">{children}</p>
    </div>
  );
}

export function FaqList({ items }) {
  return (
    <ContentCard>
      <SectionHeading>Frequently asked questions</SectionHeading>
      <div className="mt-6 divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.q} className="py-5 first:pt-0 last:pb-0">
            <h3 className="text-base font-black text-gray-900">{item.q}</h3>
            <p className="mt-2 text-sm leading-7 text-gray-600">{item.a}</p>
          </div>
        ))}
      </div>
    </ContentCard>
  );
}
