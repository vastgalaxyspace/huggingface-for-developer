import Script from 'next/script';

const AdsterraAds = () => {
  return (
    <section className="shell-container pb-12" aria-label="Sponsored ads">
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
        <div className="min-h-[90px] w-full max-w-[970px] overflow-hidden">
          <div id="container-10d59c6931b9cf13fdd44b7f2c4b515c" />
        </div>

        <div className="flex min-h-[300px] w-full max-w-[160px] justify-center overflow-hidden">
          <div />
        </div>
      </div>

      <Script
        id="adsterra-native-banner"
        async
        data-cfasync="false"
        src="https://pl29621190.effectivecpmnetwork.com/10d59c6931b9cf13fdd44b7f2c4b515c/invoke.js"
        strategy="afterInteractive"
      />
      <Script
        id="adsterra-160x300-options"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.atOptions = {
              key: '6af2b5505c0680a35b26a1d1e62badb0',
              format: 'iframe',
              height: 300,
              width: 160,
              params: {}
            };
          `,
        }}
      />
      <Script
        id="adsterra-160x300-invoke"
        src="https://www.highperformanceformat.com/6af2b5505c0680a35b26a1d1e62badb0/invoke.js"
        strategy="afterInteractive"
      />
    </section>
  );
};

export default AdsterraAds;
