import { URL } from 'url'

const blacklist = [
  'adi.admicro.vn',
  'lg1.logging.admicro.vn',
  'media1.admicro.vn',
  'cm.g.doubleclick.net',
  'pagead2.googlesyndication.com',
  'static.xx.fbcdn.net',
  's.ytimg.com',
  'i.ytimg.com',
  'www.youtube.com',
  'www.google-analytics.com',
  'scontent.fhan5-4.fna.fbcdn.net',
  'scontent.fhan5-6.fna.fbcdn.net',
  'www.facebook.com',
  'ad.caprofitx.adtdp.com',
  'ads.yahoo.com',
  'cs.adingo.jp',
  'cs.gssprt.jp',
  'images-na.ssl-images-amazon.com',
  'p.adsymptotic.com',
  'penta.a.one.impact-ad.jp',
  'stats.g.doubleclick.net',
  'www.google.com',
  'www.google.com.vn'
]

const blacklistIndices = blacklist.reduce(
  (indices, hostname) => ({
    ...indices,
    [hostname]: true
  }),
  {}
)

export default {
  isAdvertisement(url) {
    try {
      const { hostname } = new URL(url)

      return !!blacklistIndices[hostname]
    } catch (e) {
      return true
    }
  }
}
