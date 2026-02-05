'use client'

// ============================================================================
// ATOMIC GLOBAL ERROR - ABSOLUTE ISOLATION
// ============================================================================
// NO IMPORTS - NO CONTEXT - NO DEPENDENCIES
// This file is COMPLETELY isolated from the rest of the application
// Must be a pure client component with NO route segment config exports
// ============================================================================

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Error - Something went wrong</title>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          background: '#0a0a0a',
          color: '#ffffff',
        }}>
          <div style={{
            maxWidth: '500px',
            padding: '40px',
            background: '#1a1a1a',
            borderRadius: '12px',
            border: '1px solid #333',
          }}>
            <h2 style={{ 
              fontSize: '32px', 
              marginBottom: '16px',
              fontWeight: 'bold',
              color: '#ef4444'
            }}>
              Something went wrong!
            </h2>
            <p style={{ 
              marginBottom: '24px', 
              color: '#888',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              {error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
            {error?.digest && (
              <p style={{ 
                marginBottom: '24px', 
                color: '#666',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              style={{
                padding: '12px 32px',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.background = '#15803d'
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.background = '#16a34a'
              }}
            >
              Try again
            </button>
            <div style={{ marginTop: '24px' }}>
              <a
                href="/"
                style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontSize: '14px',
                }}
              >
                ← Back to home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
