import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const creatorName = searchParams.get('creator') || 'Creator'
    const fanName = searchParams.get('fan') || 'Top Fan'
    const score = searchParams.get('score') || '250'
    const streak = searchParams.get('streak') || '7'
    const title = searchParams.get('title') || 'Episode Recall Quest'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e6e6ec',
            backgroundImage:
              'radial-gradient(circle at 25px 25px, #dedee8 2%, transparent 0%), radial-gradient(circle at 75px 75px, #dedee8 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            fontFamily: 'sans-serif',
            padding: '40px 60px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              backgroundColor: '#f2f2f8',
              borderRadius: '32px',
              padding: '48px',
              border: '2px solid #ffffff',
              boxShadow: '20px 20px 60px #c4c4cb, -20px -20px 60px #ffffff',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
                borderBottom: '1px solid #dedee8',
                paddingBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    backgroundColor: '#d11149',
                    color: '#ffffff',
                    fontSize: '20px',
                    fontWeight: 'bold',
                  }}
                >
                  CF
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#16161d' }}>
                    {creatorName}
                  </span>
                  <span style={{ fontSize: '14px', color: '#737380', fontFamily: 'monospace' }}>
                    Campfire Official Fan Club
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  backgroundColor: '#fee6ed',
                  color: '#d11149',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                }}
              >
                {streak} DAY STREAK
              </div>
            </div>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
              <span
                style={{
                  fontSize: '14px',
                  color: '#737380',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                }}
              >
                {title}
              </span>
              <span
                style={{
                  fontSize: '64px',
                  fontWeight: '800',
                  color: '#d11149',
                  marginTop: '4px',
                  lineHeight: '1',
                }}
              >
                +{score}{' '}
                <span style={{ fontSize: '28px', fontWeight: 'normal', color: '#737380' }}>
                  PTS
                </span>
              </span>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '24px',
                borderTop: '2px solid #f0f0f4',
              }}
            >
              <span style={{ fontSize: '18px', color: '#16161d' }}>
                Achieved by <strong>{fanName}</strong>
              </span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#d11149',
                  fontFamily: 'monospace',
                }}
              >
                Think you can beat me? Join the Campfire →
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e: unknown) {
    return new Response('Failed to generate image', { status: 500 })
  }
}
