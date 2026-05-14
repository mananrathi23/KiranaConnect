// src/components/LoadingSpinner.jsx
export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '72px 20px', gap: 16 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--primary-btn)',
        animation: 'spin 0.75s linear infinite',
      }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{text}</p>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div style={{
      padding: '28px 24px', background: 'var(--red-soft)',
      border: '1px solid var(--red)', borderRadius: 'var(--radius-lg)',
      textAlign: 'center', color: 'var(--red)',
    }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{message}</div>
      {onRetry && (
        <button className="btn btn-outline btn-sm" style={{ marginTop: 12, borderColor: 'var(--red)', color: 'var(--red)' }} onClick={onRetry}>
          ↻ Retry
        </button>
      )}
    </div>
  );
}
