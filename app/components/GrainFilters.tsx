/**
 * 全站共用的 SVG 濾鏡：
 * grain-jitter    hover 時的顆粒化抖動（雜訊每 0.08 秒換一次種子）
 * grain-dissolve  點下去時把卡片打散的強烈位移
 */
export function GrainFilters() {
  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      className="pointer-events-none absolute"
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <defs>
        <filter id="grain-jitter" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="1" result="noise">
            <animate
              attributeName="seed"
              values="1;5;9;3;7;2"
              dur="0.48s"
              calcMode="discrete"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="grain-dissolve" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="3" result="noise">
            <animate
              attributeName="seed"
              values="3;8;1;6"
              dur="0.24s"
              calcMode="discrete"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="60" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
