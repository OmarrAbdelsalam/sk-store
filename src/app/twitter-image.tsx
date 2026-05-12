import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SK Bags - Premium handmade bags delivered across Egypt';

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #111111 0%, #7c5f4a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
            }}
          >
            SK Bags
          </div>
          <div
            style={{
              fontSize: 50,
              color: 'rgba(255, 255, 255, 0.95)',
              textAlign: 'center',
            }}
          >
            شنط هاند ميد بريميم
          </div>
          <div
            style={{
              fontSize: 35,
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
            }}
          >
            Premium handmade bags
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
