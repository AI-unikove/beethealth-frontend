/**
 * Parse URLs for lightweight embed previews (no server-side oEmbed).
 */

function tryParseUrl(raw) {
  const s = String(raw ?? '').trim()
  if (!s) return null
  try {
    return new URL(s.includes('://') ? s : `https://${s}`)
  } catch {
    return null
  }
}

function normalizeYoutubeId(id) {
  return id && /^[\w-]{11}$/.test(id) ? id : null
}

function youtubeIdFromPathSegments(pathname) {
  const seg = pathname.split('/').filter(Boolean)
  return normalizeYoutubeId(seg[1])
}

/**
 * @returns {string | null} 11-character YouTube video id
 */
export function extractYoutubeVideoId(raw) {
  const url = tryParseUrl(raw)
  if (!url) return null
  const host = url.hostname.replace(/^www\./, '')

  if (host === 'youtu.be') {
    const id = url.pathname.replace(/^\//, '').split('/')[0]
    return normalizeYoutubeId(id)
  }

  if (!host.includes('youtube.com')) return null

  const path = url.pathname
  if (path.startsWith('/shorts/') || path.startsWith('/embed/') || path.startsWith('/live/')) {
    return youtubeIdFromPathSegments(path)
  }

  return normalizeYoutubeId(url.searchParams.get('v'))
}

export function getYoutubeEmbedSrc(videoId) {
  if (!videoId) return ''
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`
}

/**
 * @returns {string | null} Vimeo numeric video id
 */
export function extractVimeoVideoId(raw) {
  const url = tryParseUrl(raw)
  if (!url) return null
  const host = url.hostname.replace(/^www\./, '')
  if (!host.includes('vimeo.com')) return null
  const parts = url.pathname.split('/').filter(Boolean)
  const id = parts[0] === 'video' ? parts[1] : parts[0]
  if (id && /^\d+$/.test(id)) return id
  return null
}

export function getVimeoEmbedSrc(videoId) {
  if (!videoId) return ''
  return `https://player.vimeo.com/video/${encodeURIComponent(videoId)}`
}

export function getSafeUrlForPreview(raw) {
  return tryParseUrl(raw)
}
