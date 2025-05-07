// services/cacheService.js
const fs = require("fs/promises")
const path = require("path")
const crypto = require("crypto")

// Cache directory
const CACHE_DIR = path.join(__dirname, "../cache")

// Ensure cache directory exists
async function ensureCacheDir() {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true })
    } catch (err) {
        console.error("Error creating cache directory:", err)
    }
}

// Generate cache key from book and chapters
function generateCacheKey(book, chapters) {
    const data = JSON.stringify({
        bookId: book.id,
        title: book.title,
        updatedAt: book.updatedAt,
        chaptersHash: chapters.map((c) => ({
            id: c.id,
            title: c.title,
            updatedAt: c.updatedAt,
        })),
    })

    return crypto.createHash("md5").update(data).digest("hex")
}

// Check if PDF is cached
async function getCachedPdf(cacheKey) {
    await ensureCacheDir()
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.pdf`)

    try {
        const stats = await fs.stat(cachePath)
        // Check if cache is less than 1 hour old
        if (Date.now() - stats.mtime.getTime() < 3600000) {
            return await fs.readFile(cachePath)
        }
    } catch (err) {
        // File doesn't exist or other error
        return null
    }

    return null
}

// Save PDF to cache
async function cachePdf(cacheKey, pdfBuffer) {
    await ensureCacheDir()
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.pdf`)

    try {
        await fs.writeFile(cachePath, pdfBuffer)
        return true
    } catch (err) {
        console.error("Error caching PDF:", err)
        return false
    }
}

module.exports = {
    generateCacheKey,
    getCachedPdf,
    cachePdf,
}
