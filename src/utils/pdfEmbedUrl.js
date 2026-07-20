/**
 * Appends Chrome/Edge PDF viewer fragment hints to hide most built-in UI.
 * Blob URLs cannot use fragments; the browser may still show the PDF toolbar.
 */
export function pdfEmbedUrl(url) {
  if (!url || typeof url !== 'string') {
    return ''
  }
  if (url.startsWith('blob:')) {
    return url
  }
  const [base, existingHash] = url.split('#')
  const hints = 'toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH'
  const h = (existingHash || '').trim()
  if (!h) {
    return `${base}#${hints}`
  }
  return `${base}#${h}&${hints}`
}
