export default function SecurityHeader({ title, level }: { title?: string, level?: string }) {
  return (
    <div className="security-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{title || 'OFFICIAL-SENSITIVE — MINISTRY OF DEFENCE'}</span>
      {level && <span style={{ color: level === 'TOP SECRET' || level === 'SECRET' ? '#f87171' : '#60a5fa', fontWeight: 600 }}>{level}</span>}
    </div>
  )
}
