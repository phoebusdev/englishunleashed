'use client'

import { useState } from 'react'

interface DownloadButtonProps {
  orderId: string
  packId: string
  packTitle: string
}

export function DownloadButton({ orderId, packId, packTitle }: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get the secure download URL from the API
      const response = await fetch('/api/download-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          packId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate download URL')
      }

      const { downloadUrl } = await response.json()

      // Redirect to the download URL
      window.location.href = downloadUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generating...' : `Download ${packTitle} PDF`}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
