import Link from 'next/link'

export default function DishNotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ minHeight: '80vh', paddingTop: '80px' }}
    >
      <span style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🍽️</span>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2.5rem',
          marginBottom: '1rem',
        }}
      >
        Dish Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        This dish may no longer be available or the link is incorrect.
      </p>
      <Link href="/menu" className="btn-crimson">
        Back to Menu
      </Link>
    </div>
  )
}