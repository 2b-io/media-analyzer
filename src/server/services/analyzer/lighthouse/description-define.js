const AUDIT_DESCRIPTION = {
  'first-contentful-paint': {
    description:'First Contentful Paint marks the time at which the first text or image is painted.'
  },
  'first-meaningful-paint': {
    description: 'First Meaningful Paint measures when the primary content of a page is visible.'
  },
  'speed-index': {
    description: 'Speed Index shows how quickly the contents of a page are visibly populated.'
  },
  'first-cpu-idle': {
    description:'First CPU Idle marks the first time at which the page&apos;s main thread is quiet enough to handle input.'
  },
  'interactive': {
    description: 'Time to interactive is the amount of time it takes for the page to become fully interactive.'
  },
  'max-potential-fid': {
    description: 'The potential First Input Delay that your users could experience is the duration, in milliseconds, of the longest task.'
  },
  'font-display': {
    description: 'Leverage the font-display CSS feature to ensure text is user-visible while webfonts are loading.'
  },
  'uses-rel-preload': {
    description: 'Consider using <link rel=preload> to prioritize fetching resources that are currently requested later in page load.'
  },
  'redirects': {
    description: 'Redirects introduce additional delays before the page can be loaded.'
  },
  'time-to-first-byte': {
    description: 'Time To First Byte identifies the time at which your server sends a response.'
  },
  'user-timings': {
    description: 'Consider instrumenting your app with the User Timing API to measure your app&apos;s real-world performance during key user experiences.'
  },
  'critical-request-chains': {
    description:'The Critical Request Chains below show you what resources are loaded with a high priority. Consider reducing the length of chains, reducing the download size of resources, or deferring the download of unnecessary resources to improve page load.'
  },
  'mainthread-work-breakdown': {
    description: 'Consider reducing the time spent parsing, compiling and executing JS. You may find delivering smaller JS payloads helps with this.'
  },
  'bootup-time': {
    description: 'Consider reducing the time spent parsing, compiling, and executing JS. You may find delivering smaller JS payloads helps with this.'
  },
  'uses-rel-preconnect': {
    description: 'Consider adding preconnect or dns-prefetch resource hints to establish early connections to important third-party origins.'
  },
  'uses-long-cache-ttl': {
    description: 'A long cache lifetime can speed up repeat visits to your page.'
  },
  'offscreen-images': {
    description: 'Consider lazy-loading offscreen and hidden images after all critical resources have finished loading to lower time to interactive.'
  },
  'unminified-css': {
    description: 'Minifying CSS files can reduce network payload sizes.'
  },
  'unminified-javascript': {
    description: 'Minifying JavaScript files can reduce payload sizes and script parse time.'
  },
  'uses-webp-images': {
    description: 'Image formats like JPEG 2000, JPEG XR, and WebP often provide better compression than PNG or JPEG, which means faster downloads and less data consumption.'
  },
  'uses-optimized-images': {
    description: 'Optimized images load faster and consume less cellular data.'
  },
  'uses-text-compression': {
    description: 'Text-based resources should be served with compression (gzip, deflate or brotli) to minimize total network bytes.'
  },
  'uses-responsive-images': {
    description: 'Serve images that are appropriately-sized to save cellular data and improve load time.'
  },
  'render-blocking-resources': {
    description: 'description'
  },
  'total-byte-weight': {
    description: ''
  },
  'dom-size': {
    description:'Browser engineers recommend pages contain fewer than ~1,500 DOM nodes. The sweet spot is a tree depth < 32 elements and fewer than 60 children/parent element. A large DOM can increase memory usage, cause longer.'
  }
}

export default AUDIT_DESCRIPTION
