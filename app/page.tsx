'use client'

import dynamic from 'next/dynamic'

// Dynamic import the entire page content to avoid SSR hydration issues
const PageContent = dynamic(() => import('./PageContent'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
      <div className="text-white">Loading...</div>
    </div>
  ),
})

export default function Page() {
  return <PageContent />
}
