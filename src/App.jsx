import { useState, useEffect, useCallback } from 'react'
import './App.css'

// Match all case variants: .jpg .JPG .jpeg .JPEG .png .webp
const imageModules = import.meta.glob(
  './assets/pic*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP}',
  { eager: true }
)
const photos = Object.keys(imageModules)
  .sort((a, b) => {
    const n = (s) => parseInt(s.match(/pic-?(\d+)/i)?.[1] ?? 0)
    return n(a) - n(b)
  })
  .map(key => imageModules[key].default)

const MODAL_CONTENT = {
  watch: {
    paragraphs: [
      'Hi daddy,',
      "Happy Fathers Day! Thank you for being the best father I can have, especially for supporting me through thick or thin and through my own ventures as well. I will forever cherish the memories we have together and uphold the words and teachings you have instilled in me. I truly hope you have a great Fathers Day, love you 😻.",
      'Love,',
      'Trisha',
    ],
  },
  flag: {
    paragraphs: [
      'Dear Daddy,',
      "I deeply appreciate and love you, daddy. Thank you for always guiding and loving me throughout all these years. You are, without a doubt, the best dad anyone could ask for. The lessons you have taught, and the memories you've helped create are treasures to me. I deeply admire you for your tenacity and discipline, how you always persevere in what you do, which encourages me to always push forward no matter what obstacle I face. Thank you for all the times you have showed up for me, even when sometimes time doesn't allow you to. Thank you for all the silent sacrifices you have made which allowed me to go to the top colleges and universities. Thank you for your time, and your care, but I hope that my actions, my respect and my own love for you can at least reflect a fraction of what you truly deserve. I am so fortunate, so blessed to be able to call you my dad. Your influence has shaped me into the woman I am today, and for that, I am forever grateful. Thank you for everything daddy, I love you more than words can express.",
      'Love ❤️,',
      'Swetha the Amazing Daughter',
    ],
  },
}

// Car silhouette: cabin trapezoid + body rectangle, 8 vertices
const CAR_PATH = 'M 228,50 L 572,50 L 622,122 L 772,122 L 772,192 L 28,192 L 28,122 L 178,122 Z'

// Each heart: emoji, font-size (px), left (%), duration (s), delay (s, negative = already airborne)
const HEARTS = [
  { e: '❤️',  s: 22, l: 2,  d: 4.2, delay: -1.0 },
  { e: '🩷',  s: 16, l: 7,  d: 5.1, delay: -3.2 },
  { e: '💖',  s: 28, l: 13, d: 3.8, delay: -0.6 },
  { e: '💗',  s: 18, l: 19, d: 5.5, delay: -4.1 },
  { e: '❤️',  s: 24, l: 25, d: 4.0, delay: -1.8 },
  { e: '💕',  s: 14, l: 31, d: 4.8, delay: -2.9 },
  { e: '💝',  s: 30, l: 37, d: 3.5, delay: -0.3 },
  { e: '💓',  s: 20, l: 43, d: 5.2, delay: -3.7 },
  { e: '❤️',  s: 16, l: 49, d: 4.4, delay: -1.4 },
  { e: '🩷',  s: 26, l: 55, d: 3.7, delay: -2.5 },
  { e: '💖',  s: 18, l: 61, d: 5.0, delay: -0.9 },
  { e: '💗',  s: 22, l: 67, d: 4.6, delay: -4.3 },
  { e: '💕',  s: 14, l: 73, d: 3.9, delay: -1.7 },
  { e: '❤️',  s: 24, l: 79, d: 5.3, delay: -3.0 },
  { e: '💝',  s: 20, l: 85, d: 4.1, delay: -0.5 },
  { e: '🩷',  s: 16, l: 91, d: 4.7, delay: -2.2 },
  { e: '💓',  s: 28, l: 96, d: 3.6, delay: -3.9 },
  { e: '❤️',  s: 18, l: 5,  d: 5.4, delay: -4.8 },
  { e: '💖',  s: 22, l: 16, d: 4.3, delay: -2.7 },
  { e: '💗',  s: 14, l: 28, d: 3.4, delay: -1.2 },
  { e: '💕',  s: 26, l: 40, d: 5.1, delay: -3.5 },
  { e: '❤️',  s: 20, l: 52, d: 4.5, delay: -0.8 },
  { e: '🩷',  s: 24, l: 64, d: 3.8, delay: -4.0 },
  { e: '💖',  s: 16, l: 76, d: 5.3, delay: -2.1 },
  { e: '💝',  s: 28, l: 88, d: 4.0, delay: -1.5 },
  { e: '💓',  s: 18, l: 10, d: 4.9, delay: -3.3 },
  { e: '❤️',  s: 22, l: 34, d: 3.6, delay: -0.4 },
  { e: '🩷',  s: 20, l: 58, d: 5.0, delay: -2.8 },
  { e: '💗',  s: 16, l: 82, d: 4.2, delay: -4.5 },
  { e: '💖',  s: 24, l: 94, d: 3.9, delay: -1.9 },
]

function FloatingHearts() {
  return (
    <div className="hearts-container" aria-hidden="true">
      {HEARTS.map((h, i) => (
        <span
          key={i}
          className="heart"
          style={{
            left: `${h.l}%`,
            fontSize: `${h.s}px`,
            animationDuration: `${h.d}s`,
            animationDelay: `${h.delay}s`,
          }}
        >
          {h.e}
        </span>
      ))}
    </div>
  )
}

function WheelSpokes() {
  return (
    <g className="wheel-hub">
      <line x1="0" y1="-20" x2="0" y2="20" stroke="#bbb" strokeWidth="4" strokeLinecap="round" />
      <line x1="-20" y1="0" x2="20" y2="0" stroke="#bbb" strokeWidth="4" strokeLinecap="round" />
      <line x1="-14" y1="-14" x2="14" y2="14" stroke="#999" strokeWidth="3" strokeLinecap="round" />
      <line x1="14" y1="-14" x2="-14" y2="14" stroke="#999" strokeWidth="3" strokeLinecap="round" />
      <circle r="7" fill="#ddd" />
    </g>
  )
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [modal, setModal] = useState(null)
  const [fading, setFading] = useState(false)

  const goTo = useCallback((index) => {
    setFading(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setFading(false)
    }, 150)
  }, [])

  const prev = () => goTo((currentIndex - 1 + photos.length) % photos.length)
  const next = () => goTo((currentIndex + 1) % photos.length)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setModal(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="page">
      <FloatingHearts />
      <button className="corner-icon corner-icon--left" aria-label="Open watch message" onClick={() => setModal('watch')}>
        ⌚
      </button>
      <button className="corner-icon corner-icon--right" aria-label="Open checkered flag message" onClick={() => setModal('flag')}>
        🏁
      </button>

      <h1 className="title">Happy Father&apos;s Day!</h1>
      <h3 className="sub-title">Here&apos;s a lil gift for you!</h3>

      <div className="scene">
        <button className="arrow" onClick={prev} aria-label="Previous photo">◀</button>

        <div className="car-wrapper">
          <svg
            className="car-svg car-body"
            viewBox="0 0 800 260"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              {/* Clips photo rect to the full car outline */}
              <clipPath id="photo-clip">
                <path d={CAR_PATH} />
              </clipPath>

              <pattern id="lane-dash" x="0" y="0" width="100" height="4" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="60" height="4" fill="#FFD700" />
              </pattern>
            </defs>

            {/* ── Road ──────────────────────────────────── */}
            <rect x="0" y="215" width="800" height="45" fill="#111" />
            <rect x="0" y="215" width="800" height="3" fill="#333" />
            <rect x="0" y="233" width="800" height="5" fill="url(#lane-dash)" />

            {/* ── Car body ─────────────────────────────── */}
            <path d={CAR_PATH} fill="#D8332A" />

            {/* ── Photo frame: covers cabin + most of car body, clipped to car outline */}
            <g clipPath="url(#photo-clip)">
              <rect x="110" y="50" width="580" height="136" fill="#A8CBE0" />
              <foreignObject x="110" y="50" width="580" height="136">
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{ width: '100%', height: '100%', overflow: 'hidden' }}
                >
                  <img
                    src={photos[currentIndex]}
                    alt={`Photo ${currentIndex + 1} of ${photos.length}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      opacity: fading ? 0 : 1,
                      transition: 'opacity 0.15s ease',
                    }}
                  />
                </div>
              </foreignObject>
              <rect x="110" y="50" width="580" height="136" fill="none" stroke="#2a2a2a" strokeWidth="2" />
            </g>

            {/* ── Car outline on top of window ─────────── */}
            <path
              d={CAR_PATH}
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Door-panel separator lines */}
            <line x1="228" y1="122" x2="228" y2="192" stroke="rgba(0,0,0,0.35)" strokeWidth="2.5" />
            <line x1="572" y1="122" x2="572" y2="192" stroke="rgba(0,0,0,0.35)" strokeWidth="2.5" />

            {/* Taillight (rear-left) */}
            <rect x="28" y="130" width="14" height="28" rx="4" fill="#FF3333" stroke="#111" strokeWidth="1" />
            {/* Rear bumper pip */}
            <rect x="28" y="173" width="9" height="14" rx="3" fill="#B02020" />

            {/* Headlight (front-right) */}
            <rect x="758" y="130" width="14" height="28" rx="4" fill="#FFEE77" stroke="#111" strokeWidth="1" />
            {/* Front bumper pip */}
            <rect x="763" y="173" width="9" height="14" rx="3" fill="#B02020" />

            {/* ── Left wheel ────────────────────────────── */}
            <g transform="translate(190, 188)">
              <circle r="36" fill="#1a1a1a" />
              <circle r="25" fill="#3a3a3a" />
              <WheelSpokes />
            </g>

            {/* ── Right wheel ───────────────────────────── */}
            <g transform="translate(610, 188)">
              <circle r="36" fill="#1a1a1a" />
              <circle r="25" fill="#3a3a3a" />
              <WheelSpokes />
            </g>
          </svg>
        </div>

        <button className="arrow" onClick={next} aria-label="Next photo">▶</button>
      </div>

      {/* Dot indicators */}
      <div className="dots" role="tablist" aria-label="Photo indicators">
        {photos.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === currentIndex}
            className={`dot${i === currentIndex ? ' dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to photo ${i + 1}`}
          />
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" aria-label="Close" onClick={() => setModal(null)}>
              ✕
            </button>
            {MODAL_CONTENT[modal].paragraphs.map((para, i) => (
              <p key={i} className="modal-message">{para}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
