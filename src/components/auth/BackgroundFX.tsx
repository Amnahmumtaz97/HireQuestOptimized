export function BackgroundFX() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-glow animate-pulse-glow" />
      <div
        className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-glow animate-pulse-glow"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute top-1/3 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gradient-glow opacity-50 animate-pulse-glow"
        style={{ animationDelay: '1s' }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(120,200,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(120,200,255,0.6) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <span
          key={i}
          className="absolute block rounded-full animate-float"
          style={{
            top: `${(i * 53) % 100}%`,
            left: `${(i * 37) % 100}%`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            background: 'oklch(0.85 0.15 220)',
            boxShadow: '0 0 10px oklch(0.78 0.20 215 / 0.8)',
            opacity: 0.5,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${5 + (i % 5)}s`,
          }}
        />
      ))}
    </div>
  )
}
