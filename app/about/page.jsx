export const metadata = {
  title: 'About Us | Model Explorer',
  description: 'Learn more about Model Explorer and our mission to make AI accessible.',
};

export default function AboutPage() {
  return (
    <div className="shell-container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-strong)] mb-6">
          About Us
        </h1>
        <p className="text-lg text-[var(--text-muted)] mb-12">
          Our mission is to empower developers and researchers by organizing the world's most capable AI models into an accessible, comparative platform.
        </p>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-4">
              Our Vision
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              As the artificial intelligence landscape expands at an unprecedented rate, keeping track of new models, their capabilities, and their ideal use cases has become increasingly complex. We built Model Explorer to serve as a comprehensive, unbiased hub for discovering and comparing Large Language Models.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-4">
              What We Do
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow">
                <h3 className="font-bold text-[var(--text-strong)] mb-2">Model Discovery</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Easily search, filter, and discover models based on parameters, context length, and licensing to find the perfect fit for your project.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow">
                <h3 className="font-bold text-[var(--text-strong)] mb-2">Detailed Comparisons</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Side-by-side technical specification comparisons to help you make informed decisions about your AI stack.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
