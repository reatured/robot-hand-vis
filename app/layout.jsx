import './global.css'

export const metadata = {
  title: 'Robot Hand Visualization',
  description: 'AR hand-gesture-controlled robot hand using URDF Loader, Zustand, React Three Fiber',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='antialiased'>
      <head />
      <body>
        {children}
      </body>
    </html>
  )
}
