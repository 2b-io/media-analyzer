const MOBILE_STRUCT_DATA = {
  userAgent: '',
  fetchTime: '',
  requestedUrl: '',
  finalUrl: '',
  audits: {
    firstContentfulPaint: {
      title: 'First Contentful Paint',
      description: 'First Contentful Paint marks the time at which the first text or image is painted. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/first-contentful-paint).',
      rawValue: '',
      displayValue: ''
    },
    firstMmeaningfulPaint: {
      title: 'First Meaningful Paint',
      description: 'First Meaningful Paint measures when the primary content of a page is visible. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint).',
      rawValue: '',
      displayValue: ''
    },
    speedIndex: {
      title: 'Speed Index',
      description: 'Speed Index shows how quickly the contents of a page are visibly populated. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/speed-index).',
      rawValue: '',
      displayValue: ''
    },
    firstCpuIdle: {
      title: 'First CPU Idle',
      description: 'First CPU Idle marks the first time at which the page&apos;s main thread is quiet enough to handle input. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/first-interactive).',
      rawValue: '',
      displayValue: ''
    },
    interactive: {
      title: 'Time to Interactive',
      description: 'Time to interactive is the amount of time it takes for the page to become fully interactive. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/consistently-interactive).',
      rawValue: '',
      displayValue: ''
    },
    maxPotentialFid: {
      title: 'Max Potential FID',
      description: 'The potential First Input Delay that your users could experience is the duration, in milliseconds, of the longest task.',
      rawValue: '',
      displayValue: ''
    },
    fontDisplay: {
      title: 'Ensure text remains visible during webfont load',
      description: 'Leverage the font-display CSS feature to ensure text is user-visible while webfonts are loading. [Learn more](https://developers.google.com/web/updates/2016/02/font-display).',
      rawValue: '',
      displayValue: ''
    },
    usesRelPreload: {
      title: 'Preload key requests',
      description: 'Consider using <link rel=preload> to prioritize fetching resources that are currently requested later in page load. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/preload).',
      rawValue: '',
      displayValue: ''
    },
    redirects: {
      title: 'Avoid multiple page redirects',
      description: 'Redirects introduce additional delays before the page can be loaded. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/redirects).',
      rawValue: '',
      displayValue: ''
    },
    timeToFirstByte: {
      title: 'Server response times are low (TTFB)',
      description: 'Time To First Byte identifies the time at which your server sends a response. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/ttfb).',
      rawValue: '',
      displayValue: ''
    },
    userTimings: {
      title: 'User Timing marks and measures',
      description: 'Consider instrumenting your app with the User Timing API to measure your app&apos;s real-world performance during key user experiences. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/user-timing).',
      rawValue: '',
      displayValue: ''
    },
    criticalRequestChains: {
      title: 'Minimize Critical Requests Depth',
      description: 'The Critical Request Chains below show you what resources are loaded with a high priority. Consider reducing the length of chains, reducing the download size of resources, or deferring the download of unnecessary resources to improve page load. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/critical-request-chains).',
      rawValue: '',
      displayValue: ''
    },
    mainthreadWorkBreakdown: {
      title: 'Minimize main-thread work',
      description: 'Consider reducing the time spent parsing, compiling and executing JS. You may find delivering smaller JS payloads helps with this.',
      rawValue: '',
      displayValue: ''
    },
    bootupTime: {
      title: 'Reduce JavaScript execution time',
      description: 'Consider reducing the time spent parsing, compiling, and executing JS. You may find delivering smaller JS payloads helps with this. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/bootup).',
      rawValue: '',
      displayValue: ''
    },
    usesRelPreconnect: {
      title: 'Preconnect to required origins',
      description: 'Consider adding preconnect or dns-prefetch resource hints to establish early connections to important third-party origins. [Learn more](https://developers.google.com/web/fundamentals/performance/resource-prioritization#preconnect).',
      rawValue: '',
      displayValue: ''
    },
    usesLongCacheTtl: {
      title: 'Uses efficient cache policy on static assets',
      description: 'A long cache lifetime can speed up repeat visits to your page. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/cache-policy).',
      rawValue: '',
      displayValue: ''
    },
    offScreenImages: {
      title: 'Defer offscreen images',
      description: 'Consider lazy-loading offscreen and hidden images after all critical resources have finished loading to lower time to interactive. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/offscreen-images).',
      rawValue: '',
      displayValue: ''
    },
    unminifiedCss: {
      title: 'Minify CSS',
      description: 'Minifying CSS files can reduce network payload sizes. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/minify-css).',
      rawValue: '',
      displayValue: ''
    },
    unminifiedJavascript: {
      title: 'Minify JavaScript',
      description: 'Minifying JavaScript files can reduce payload sizes and script parse time. [Learn more](https://developers.google.com/speed/docs/insights/MinifyResources).',
      rawValue: '',
      displayValue: ''
    },
    usesWebpImages: {
      title: 'Serve images in next-gen formats',
      description: 'Image formats like JPEG 2000, JPEG XR, and WebP often provide better compression than PNG or JPEG, which means faster downloads and less data consumption. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/webp).',
      rawValue: '',
      displayValue: ''
    },
    usesOptimizedImages: {
      title: 'Efficiently encode images',
      description: 'Optimized images load faster and consume less cellular data. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/optimize-images).',
      rawValue: '',
      displayValue: '',
      details: {
        items: [],
        overallSavingsMs: '',
        overallSavingsBytes: ''
      }
    },
    usesTextCompression: {
      title: 'Enable text compression',
      description: 'Text-based resources should be served with compression (gzip, deflate or brotli) to minimize total network bytes. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/text-compression).',
      rawValue: '',
      displayValue: '',
      details: {
        items: [],
        overallSavingsMs: '',
        overallSavingsBytes: ''
      }
    },
    usesResponsiveImages: {
      title: 'Properly size images',
      description: 'Serve images that are appropriately-sized to save cellular data and improve load time. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/oversized-images).',
      rawValue: '',
      displayValue: '',
      details: {
        items: [],
        overallSavingsMs: '',
        overallSavingsBytes: ''
      }
    },
    domSize: {
      title: 'Avoids an excessive DOM size',
      description: 'Browser engineers recommend pages contain fewer than ~1,500 DOM nodes. The sweet spot is a tree depth < 32 elements and fewer than 60 children/parent element. A large DOM can increase memory usage, cause longer [style calculations](https://developers.google.com/web/fundamentals/performance/rendering/reduce-the-scope-and-complexity-of-style-calculations), and produce costly [layout reflows](https://developers.google.com/speed/articles/reflow). [Learn more](https://developers.google.com/web/tools/lighthouse/audits/dom-size).',
      rawValue: '',
      displayValue: '',

      details: {
        items: []
      }
    },
  }
}

const DESKTOP_STRUCT_DATA = {
  userAgent: '',
  fetchTime: '',
  requestedUrl: '',
  finalUrl: '',
  audits: {
    firstContentfulPaint: {
      title: 'First Contentful Paint',
      description: 'First Contentful Paint marks the time at which the first text or image is painted. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/first-contentful-paint).',
      rawValue: '',
      displayValue: ''
    },
    firstMmeaningfulPaint: {
      title: 'First Meaningful Paint',
      description: 'First Meaningful Paint measures when the primary content of a page is visible. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint).',
      rawValue: '',
      displayValue: ''
    },
    speedIndex: {
      title: 'Speed Index',
      description: 'Speed Index shows how quickly the contents of a page are visibly populated. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/speed-index).',
      rawValue: '',
      displayValue: ''
    },
    firstCpuIdle: {
      title: 'First CPU Idle',
      description: 'First CPU Idle marks the first time at which the page&apos;s main thread is quiet enough to handle input. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/first-interactive).',
      rawValue: '',
      displayValue: ''
    },
    interactive: {
      title: 'Time to Interactive',
      description: 'Time to interactive is the amount of time it takes for the page to become fully interactive. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/consistently-interactive).',
      rawValue: '',
      displayValue: ''
    },
    maxPotentialFid: {
      title: 'Max Potential FID',
      description: 'The potential First Input Delay that your users could experience is the duration, in milliseconds, of the longest task.',
      rawValue: '',
      displayValue: ''
    },
    fontDisplay: {
      title: 'Ensure text remains visible during webfont load',
      description: 'Leverage the font-display CSS feature to ensure text is user-visible while webfonts are loading. [Learn more](https://developers.google.com/web/updates/2016/02/font-display).',
      rawValue: '',
      displayValue: ''
    },
    usesRelPreload: {
      title: 'Preload key requests',
      description: 'Consider using <link rel=preload> to prioritize fetching resources that are currently requested later in page load. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/preload).',
      rawValue: '',
      displayValue: ''
    },
    redirects: {
      title: 'Avoid multiple page redirects',
      description: 'Redirects introduce additional delays before the page can be loaded. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/redirects).',
      rawValue: '',
      displayValue: ''
    },
    timeToFirstByte: {
      title: 'Server response times are low (TTFB)',
      description: 'Time To First Byte identifies the time at which your server sends a response. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/ttfb).',
      rawValue: '',
      displayValue: ''
    },
    userTimings: {
      title: 'User Timing marks and measures',
      description: 'Consider instrumenting your app with the User Timing API to measure your app&apos;s real-world performance during key user experiences. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/user-timing).',
      rawValue: '',
      displayValue: ''
    },
    criticalRequestChains: {
      title: 'Minimize Critical Requests Depth',
      description: 'The Critical Request Chains below show you what resources are loaded with a high priority. Consider reducing the length of chains, reducing the download size of resources, or deferring the download of unnecessary resources to improve page load. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/critical-request-chains).',
      rawValue: '',
      displayValue: ''
    },
    mainthreadWorkBreakdown: {
      title: 'Minimize main-thread work',
      description: 'Consider reducing the time spent parsing, compiling and executing JS. You may find delivering smaller JS payloads helps with this.',
      rawValue: '',
      displayValue: ''
    },
    bootupTime: {
      title: 'Reduce JavaScript execution time',
      description: 'Consider reducing the time spent parsing, compiling, and executing JS. You may find delivering smaller JS payloads helps with this. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/bootup).',
      rawValue: '',
      displayValue: ''
    },
    usesRelPreconnect: {
      title: 'Preconnect to required origins',
      description: 'Consider adding preconnect or dns-prefetch resource hints to establish early connections to important third-party origins. [Learn more](https://developers.google.com/web/fundamentals/performance/resource-prioritization#preconnect).',
      rawValue: '',
      displayValue: ''
    },
    usesLongCacheTtl: {
      title: 'Uses efficient cache policy on static assets',
      description: 'A long cache lifetime can speed up repeat visits to your page. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/cache-policy).',
      rawValue: '',
      displayValue: ''
    },
    offScreenImages: {
      title: 'Defer offscreen images',
      description: 'Consider lazy-loading offscreen and hidden images after all critical resources have finished loading to lower time to interactive. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/offscreen-images).',
      rawValue: '',
      displayValue: ''
    },
    unminifiedCss: {
      title: 'Minify CSS',
      description: 'Minifying CSS files can reduce network payload sizes. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/minify-css).',
      rawValue: '',
      displayValue: ''
    },
    unminifiedJavascript: {
      title: 'Minify JavaScript',
      description: 'Minifying JavaScript files can reduce payload sizes and script parse time. [Learn more](https://developers.google.com/speed/docs/insights/MinifyResources).',
      rawValue: '',
      displayValue: ''
    },
    usesWebpImages: {
      title: 'Serve images in next-gen formats',
      description: 'Image formats like JPEG 2000, JPEG XR, and WebP often provide better compression than PNG or JPEG, which means faster downloads and less data consumption. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/webp).',
      rawValue: '',
      displayValue: ''
    },
    usesOptimizedImages: {
      title: 'Efficiently encode images',
      description: 'Optimized images load faster and consume less cellular data. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/optimize-images).',
      rawValue: '',
      displayValue: '',
      details: {
        items: [],
        overallSavingsMs: '',
        overallSavingsBytes: ''
      }
    },
    usesTextCompression: {
      title: 'Enable text compression',
      description: 'Text-based resources should be served with compression (gzip, deflate or brotli) to minimize total network bytes. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/text-compression).',
      rawValue: '',
      displayValue: '',
      details: {
        items: [],
        overallSavingsMs: '',
        overallSavingsBytes: ''
      }
    },
    usesResponsiveImages: {
      title: 'Properly size images',
      description: 'Serve images that are appropriately-sized to save cellular data and improve load time. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/oversized-images).',
      rawValue: '',
      displayValue: '',
      details: {
        items: [],
        overallSavingsMs: '',
        overallSavingsBytes: ''
      }
    },
    domSize: {
      title: 'Avoids an excessive DOM size',
      description: 'Browser engineers recommend pages contain fewer than ~1,500 DOM nodes. The sweet spot is a tree depth < 32 elements and fewer than 60 children/parent element. A large DOM can increase memory usage, cause longer [style calculations](https://developers.google.com/web/fundamentals/performance/rendering/reduce-the-scope-and-complexity-of-style-calculations), and produce costly [layout reflows](https://developers.google.com/speed/articles/reflow). [Learn more](https://developers.google.com/web/tools/lighthouse/audits/dom-size).',
      rawValue: '',
      displayValue: '',
      details: {
        items: []
      }
    },
  }
}

export {
  MOBILE_STRUCT_DATA as mobileStructData,
  DESKTOP_STRUCT_DATA as desktopStructData
}
