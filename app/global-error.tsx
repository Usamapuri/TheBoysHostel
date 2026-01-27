'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          background: '#0a0a0a',
          color: '#fff',
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Something went wrong!</h2>
          <p style={{ marginBottom: '20px', color: '#888' }}>
            {error.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              background: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
