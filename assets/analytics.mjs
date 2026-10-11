// Public site identifier only; never put an API key in the published assets.
export const analyticsOrigin = 'https://marcomc-site.goatcounter.com';

export function analyticsVisit({href, referrer = '', doNotTrack, windowDoNotTrack, globalPrivacyControl, webdriver}) {
  const page = new URL(href);
  if (page.origin !== 'https://marcomc.com' || doNotTrack === '1' || windowDoNotTrack === '1' || globalPrivacyControl || webdriver) return null;
  // Only generated public pages are counted. Never send queries, fragments or
  // arbitrary paths from missing URLs, which can contain private information.
  if (!/^\/(?:fr\/|it\/|pt\/)?(?:bio\/|privacy\/)?$/.test(page.pathname)) return null;
  let source = '';
  try {
    const referringPage = new URL(referrer);
    if (['https:', 'http:'].includes(referringPage.protocol) && referringPage.origin !== page.origin) source = referringPage.origin;
  } catch { /* Direct visits do not have a referring website. */ }
  const pixel = new URL('/count', analyticsOrigin);
  pixel.searchParams.set('p', page.pathname);
  pixel.searchParams.set('t', `MarcoMC ${page.pathname}`);
  pixel.searchParams.set('r', source);
  pixel.searchParams.set('rnd', Math.random().toString(36).slice(2));
  return {pixel:pixel.href, counter:`${analyticsOrigin}/counter/TOTAL.json`};
}

export function visitorTotal(value, locale) {
  if (typeof value === 'string' && /^\d+(?:[, .\u00a0\u202f]\d{3})*$/.test(value)) value = Number(value.replace(/[, .\u00a0\u202f]/g, ''));
  if (!Number.isSafeInteger(value) || value < 0) return null;
  return new Intl.NumberFormat(locale, {useGrouping:'always'}).format(value);
}

if (typeof document !== 'undefined') {
  const visit = analyticsVisit({href:location.href,referrer:document.referrer,
    doNotTrack:navigator.doNotTrack,windowDoNotTrack:window.doNotTrack,
    globalPrivacyControl:navigator.globalPrivacyControl,webdriver:navigator.webdriver});
  if (visit && !document.getElementById('goatcounter-pixel')) {
    const pixel = document.createElement('img');
    pixel.id = 'goatcounter-pixel';
    pixel.alt = '';
    pixel.width = pixel.height = 1;
    pixel.hidden = true;
    pixel.referrerPolicy = 'no-referrer';
    pixel.src = visit.pixel;
    document.body.append(pixel);
    fetch(visit.counter, {credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(5000)})
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        const total = visitorTotal(data?.count, document.documentElement.lang);
        if (total === null) return;
        document.getElementById('visitor-count').textContent = total;
        document.getElementById('visitor-total').hidden = false;
      })
      .catch(() => { /* The statistics link remains usable if counting is blocked or unavailable. */ });
  }
}
