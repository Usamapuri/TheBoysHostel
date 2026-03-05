/**
 * Converts common sharing URLs (Google Drive, Dropbox) into direct image URLs
 * that can be used in <img> tags.
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return url

  // Google Drive: /file/d/FILE_ID/view... → /uc?export=view&id=FILE_ID
  const gdriveMatch = url.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  )
  if (gdriveMatch) {
    return `https://drive.google.com/uc?export=view&id=${gdriveMatch[1]}`
  }

  // Google Drive alternate: open?id=FILE_ID
  const gdriveOpen = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/)
  if (gdriveOpen) {
    return `https://drive.google.com/uc?export=view&id=${gdriveOpen[1]}`
  }

  // Dropbox: ?dl=0 → ?raw=1
  if (url.includes("dropbox.com")) {
    return url.replace(/[?&]dl=0/, "?raw=1")
  }

  return url
}
