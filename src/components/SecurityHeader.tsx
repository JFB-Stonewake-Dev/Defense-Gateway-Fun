export default function SecurityHeader({ title, level }: { title?: string, level?: string }) {
  return (
    <div className="security-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{title || 'OFFICIAL-SENSITIVE: MINISTRY OF DEFENCE GATEWAY — UNAUTHORISED ACCESS IS PROHIBITED'}</span>
      {level && <span style={{ color: level === 'TOP SECRET' || level === 'SECRET' ? 'var(--accent-red)' : 'var(--accent-blue)', fontWeight: 'bold' }}>[{level}]</span>}
    </div>
  )
}
