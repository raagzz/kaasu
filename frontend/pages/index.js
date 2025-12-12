import { useEffect, useState } from 'react'

export default function Home() {
  const [status, setStatus] = useState(null)
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    let mounted = true
    fetch(`${apiBase}/health`)
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setStatus(data.status ?? JSON.stringify(data))
      })
      .catch(() => {
        if (mounted) setStatus('error')
      })
    return () => {
      mounted = false
    }
  }, [apiBase])

  const isOn = status === 'ok'
  const isLoading = status === null

  return (
    <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 24, boxSizing: 'border-box'}}>
      <div style={{textAlign: 'center'}}>
        <h1 style={{fontSize: '6rem', margin: 0, lineHeight: 1}}>Kaasu</h1>
        <p style={{marginTop: 12, fontSize: '1.25rem', color: '#444', fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif'}}>
          All your <em style={{fontStyle: 'italic'}}>kaasu</em> in one place.
        </p>
      </div>

      {/* Backend status chip in bottom-right */}
      <div style={{position: 'absolute', right: 20, bottom: 20}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, background: '#f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif'}}>
          <span style={{fontSize: 12, color: '#333', textTransform: 'lowercase'}}>backend:</span>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
            <span style={{width: 10, height: 10, borderRadius: 999, display: 'inline-block', background: isLoading ? '#9CA3AF' : isOn ? '#10B981' : '#EF4444', boxShadow: isLoading ? 'none' : '0 0 8px rgba(0,0,0,0.08)'}}/>
            <span style={{fontWeight: 600, fontSize: 13, color: isLoading ? '#6B7280' : isOn ? '#065F46' : '#7F1D1D'}}>{isLoading ? 'loading...' : isOn ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
