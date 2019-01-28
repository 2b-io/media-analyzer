const loadPage = async (page, params, progress) => {
  // progress(`[${params.mode}] GET ${params.url} ...`)

  await page.goto(params.url, {
    waitUntil: params.mode || 'load',
    timeout: 2 * 60 * 1000 // 2 minutes
  })
}

export default loadPage
