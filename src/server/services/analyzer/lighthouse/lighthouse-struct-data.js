const AUDIT_STRUCT_DATA = [
  'first-contentful-paint',
  'first-meaningful-paint',
  'speed-index',
  'first-cpu-idle',
  'interactive',
  'max-potential-fid',
  'font-display',
  'uses-rel-preload',
  'redirects',
  'time-to-first-byte',
  'user-timings',
  'critical-request-chains',
  'mainthread-work-breakdown',
  'bootup-time',
  'uses-rel-preconnect',
  'uses-long-cache-ttl',
  'offscreen-images',
  'unminified-css',
  'unminified-javascript',
  'uses-webp-images',
  'uses-optimized-images',
  'uses-text-compression',
  'uses-responsive-images',
  'dom-size'
]

const LIGHTHOUSE_STRUCT_DATA = {
  userAgent: '',
  fetchTime: '',
  requestedUrl: '',
  finalUrl: '',
  audits: {
    firstContentfulPaint: {},
    firstMeaningfulPaint: {},
    speedIndex: {},
    firstCpuIdle: {},
    interactive: {},
    maxPotentialFid: {},
    fontDisplay: {},
    usesRelPreload: {},
    redirects: {},
    timeToFirstByte: {},
    userTimings: {},
    criticalRequestChains: {},
    mainthreadWorkBreakdown: {},
    bootupTime: {},
    usesRelPreconnect: {},
    usesLongCacheTtl: {},
    offScreenImages: {},
    unminifiedCss: {},
    unminifiedJavascript: {},
    usesWebpImages: {},
    usesOptimizedImages: {},
    usesTextCompression: {},
    usesResponsiveImages: {},
    domSize: {},
  }
}

export {
  LIGHTHOUSE_STRUCT_DATA as lighthouseStructData,
  AUDIT_STRUCT_DATA as auditStructData
}
