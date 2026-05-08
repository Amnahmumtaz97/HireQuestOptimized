import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

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
          background: 'radial-gradient(circle at 30% 30%, #243B55 0%, #0B1220 60%, #050814 100%)',
          color: '#E6F0FF',
          fontSize: 220,
          fontWeight: 800,
          letterSpacing: -10,
        }}
      >
        HQ
      </div>
    ),
    size,
  )
}

