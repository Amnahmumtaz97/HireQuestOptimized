import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

/** Matches `.hq-marketing-logo-mark` — brand blue with white HQ. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#2563eb',
          color: '#ffffff',
          fontSize: 210,
          fontWeight: 800,
          letterSpacing: -8,
          lineHeight: 1,
        }}
      >
        HQ
      </div>
    ),
    size,
  )
}
