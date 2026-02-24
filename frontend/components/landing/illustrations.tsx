"use client";

/**
 * Interactive professional SVG illustrations for the SplitRent landing page.
 * Clean, modern designs with animations that align with the Stellar/blockchain theme.
 */

/** Hero illustration - Payment flow with wallet and transactions */
export function PaymentFlowIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={`${className} group cursor-pointer transition-all duration-500`}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes flow { 0%, 100% { stroke-dashoffset: 8; } 50% { stroke-dashoffset: 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .pay-wallet { transition: all 0.3s ease; }
        .pay-arrow { transition: all 0.3s ease; animation: flow 2s linear infinite; stroke-dasharray: 8; }
        .pay-coin { transition: transform 0.3s ease; }
        .group:hover .pay-wallet { opacity: 0.9; }
        .group:hover .pay-coin { animation: spin 2s linear infinite; }
        .group:hover .pay-arrow { stroke: currentColor; }
      `}</style>

      {/* Background circle accent */}
      <circle
        cx="200"
        cy="150"
        r="140"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.1"
      />

      {/* Left wallet card */}
      <g className="pay-wallet">
        <rect
          x="30"
          y="80"
          width="120"
          height="90"
          rx="16"
          fill="currentColor"
          opacity="0.08"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <rect
          x="45"
          y="95"
          width="90"
          height="8"
          rx="4"
          fill="currentColor"
          opacity="0.3"
        />
        <rect
          x="45"
          y="110"
          width="60"
          height="6"
          rx="3"
          fill="currentColor"
          opacity="0.2"
        />
        <text
          x="90"
          y="145"
          textAnchor="middle"
          fill="currentColor"
          fontSize="24"
          fontWeight="bold"
          opacity="0.6"
        >
          $
        </text>
      </g>

      {/* Center arrow flow */}
      <g className="pay-arrow">
        <path
          d="M165 125 L235 125"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <polygon
          points="235,125 220,118 220,132"
          fill="currentColor"
        />
      </g>

      {/* Right transaction card */}
      <g className="pay-wallet">
        <rect
          x="250"
          y="80"
          width="120"
          height="90"
          rx="16"
          fill="currentColor"
          opacity="0.08"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        {/* Checkmark */}
        <path
          d="M280 125 L295 140 L330 105"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
      </g>

      {/* Bottom XLM coin */}
      <g className="pay-coin">
        <circle
          cx="200"
          cy="220"
          r="25"
          fill="currentColor"
          opacity="0.08"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <text
          x="200"
          y="230"
          textAnchor="middle"
          fill="currentColor"
          fontSize="18"
          fontWeight="bold"
          opacity="0.6"
        >
          XLM
        </text>
      </g>

      {/* Decorative dots */}
      <circle cx="80" cy="200" r="3" fill="currentColor" opacity="0.15" />
      <circle cx="320" cy="200" r="3" fill="currentColor" opacity="0.15" />
      <circle cx="120" cy="260" r="2" fill="currentColor" opacity="0.1" />
      <circle cx="280" cy="260" r="2" fill="currentColor" opacity="0.1" />
    </svg>
  );
}

/** Security/verification illustration */
export function VerificationIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={`${className} group cursor-pointer transition-all duration-500`}
      viewBox="0 0 300 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <style>{`
        @keyframes pulse-check { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes shield-glow { 0%, 100% { filter: drop-shadow(0 0 0px currentColor); } 50% { filter: drop-shadow(0 0 8px currentColor); } }
        .verify-shield { transition: all 0.3s ease; }
        .verify-check { animation: pulse-check 2s ease-in-out infinite; }
        .group:hover .verify-shield { filter: drop-shadow(0 0 8px currentColor); opacity: 0.95; }
      `}</style>

      {/* Shield shape */}
      <path
        className="verify-shield"
        d="M150 20 L240 60 L240 140 Q240 200 150 260 Q60 200 60 140 L60 60 Z"
        fill="currentColor"
        opacity="0.08"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      {/* Inner circle for lock */}
      <circle
        cx="150"
        cy="140"
        r="50"
        fill="currentColor"
        opacity="0.04"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Lock icon */}
      <rect
        x="125"
        y="110"
        width="50"
        height="40"
        rx="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.6"
      />

      {/* Lock shackle (top arc) */}
      <path
        d="M135 110 Q135 85 150 85 Q165 85 165 110"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.6"
      />

      {/* Lock dot */}
      <circle cx="150" cy="138" r="3" fill="currentColor" opacity="0.5" />

      {/* Checkmarks around shield */}
      <g opacity="0.4" className="verify-check">
        <path
          d="M100 100 L110 110 L120 95"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g opacity="0.4" className="verify-check">
        <path
          d="M180 100 L190 110 L200 95"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Bottom verification badge */}
      <circle
        cx="150"
        cy="280"
        r="18"
        fill="currentColor"
        opacity="0.08"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        className="verify-check"
        d="M142 280 L148 286 L158 276"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

/** Fast workflow illustration */
export function FastWorkflowIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={`${className} group cursor-pointer transition-all duration-500`}
      viewBox="0 0 300 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <style>{`
        @keyframes pulse-ripple { 0% { r: 30; opacity: 0.3; } 100% { r: 85; opacity: 0; } }
        @keyframes bolt-flash { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes arrow-dash { 0%, 100% { stroke-dashoffset: 4; } 50% { stroke-dashoffset: 0; } }
        .speed-ripple { animation: pulse-ripple 2s ease-out infinite; }
        .speed-bolt { animation: bolt-flash 1.5s ease-in-out infinite; }
        .group:hover .speed-bolt { animation: bolt-flash 0.8s ease-in-out infinite; }
      `}</style>

      {/* Central circle tracks/ripples */}
      <circle
        cx="150"
        cy="140"
        r="80"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.15"
      />
      <circle
        cx="150"
        cy="140"
        r="60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.2"
      />
      <circle
        cx="150"
        cy="140"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.3"
      />

      {/* Ripple animation */}
      <circle
        className="speed-ripple"
        cx="150"
        cy="140"
        r="30"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Center core circle */}
      <circle
        cx="150"
        cy="140"
        r="18"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      {/* Lightning bolt for speed */}
      <path
        className="speed-bolt"
        d="M150 110 L142 130 L150 130 L140 155 L150 140 L158 140 Z"
        fill="currentColor"
        opacity="0.5"
      />

      {/* Directional arrows around */}
      <g opacity="0.35">
        <path
          d="M230 100 L240 90 L230 85"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="230" y1="95" x2="245" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>

      <g opacity="0.35">
        <path
          d="M70 180 L60 190 L70 195"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="70" y1="185" x2="55" y2="200" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Timer/speedometer indicator */}
      <path
        d="M80 140 Q80 100 120 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.25"
        strokeDasharray="4 3"
      />
    </svg>
  );
}

/** Connected network illustration */
export function NetworkIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={`${className} group cursor-pointer transition-all duration-500`}
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <style>{`
        @keyframes glow-pulse { 0%, 100% { r: 3.5; opacity: 0.5; } 50% { r: 5; opacity: 0.8; } }
        @keyframes line-draw { 0%, 100% { stroke-dashoffset: 8; } 50% { stroke-dashoffset: 0; } }
        .net-node { transition: all 0.3s ease; }
        .net-pulse { animation: glow-pulse 1.5s ease-in-out infinite; }
        .net-line { animation: line-draw 2s linear infinite; stroke-dasharray: 8; }
        .group:hover .net-node { opacity: 0.95; }
        .group:hover .net-center { filter: drop-shadow(0 0 8px currentColor); }
      `}</style>

      {/* Network nodes */}
      {/* Top node */}
      <circle
        className="net-node"
        cx="140"
        cy="40"
        r="18"
        fill="currentColor"
        opacity="0.1"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      {/* Left node */}
      <circle
        className="net-node"
        cx="50"
        cy="140"
        r="18"
        fill="currentColor"
        opacity="0.1"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      {/* Right node */}
      <circle
        className="net-node"
        cx="230"
        cy="140"
        r="18"
        fill="currentColor"
        opacity="0.1"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      {/* Bottom node */}
      <circle
        className="net-node"
        cx="140"
        cy="240"
        r="18"
        fill="currentColor"
        opacity="0.1"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      {/* Center node (larger) */}
      <circle
        className="net-center"
        cx="140"
        cy="140"
        r="24"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="3"
      />

      {/* Connection lines with animations */}
      <line
        className="net-line"
        x1="140"
        y1="58"
        x2="140"
        y2="116"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.3"
      />
      <line
        className="net-line"
        x1="68"
        y1="140"
        x2="116"
        y2="140"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.3"
      />
      <line
        className="net-line"
        x1="164"
        y1="140"
        x2="212"
        y2="140"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.3"
      />
      <line
        className="net-line"
        x1="140"
        y1="164"
        x2="140"
        y2="222"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.3"
      />

      {/* Diagonal connections */}
      <line
        x1="110"
        y1="110"
        x2="68"
        y2="68"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.2"
      />
      <line
        x1="170"
        y1="110"
        x2="212"
        y2="68"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.2"
      />
      <line
        x1="110"
        y1="170"
        x2="68"
        y2="212"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.2"
      />
      <line
        x1="170"
        y1="170"
        x2="212"
        y2="212"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.2"
      />

      {/* Glowing dots at connection points */}
      <circle className="net-pulse" cx="140" cy="58" r="3.5" fill="currentColor" />
      <circle className="net-pulse" cx="68" cy="140" r="3.5" fill="currentColor" />
      <circle className="net-pulse" cx="212" cy="140" r="3.5" fill="currentColor" />
      <circle className="net-pulse" cx="140" cy="222" r="3.5" fill="currentColor" />
    </svg>
  );
}

/** Blockchain/transaction illustration */
export function BlockchainIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={`${className} group cursor-pointer transition-all duration-500`}
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <style>{`
        @keyframes chain-link { 0%, 100% { stroke-dashoffset: 8; stroke-width: 2.5; } 50% { stroke-dashoffset: 0; stroke-width: 3; } }
        @keyframes block-pulse { 0%, 100% { opacity: 0.08; } 50% { opacity: 0.15; } }
        @keyframes checkmark-draw { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
        .block { animation: block-pulse 2s ease-in-out infinite; transition: all 0.3s ease; }
        .block-link { animation: chain-link 2s linear infinite; stroke-dasharray: 8; }
        .block-check { animation: checkmark-draw 1.5s ease-in-out forwards; stroke-dasharray: 24; }
        .group:hover .block { opacity: 0.15; }
        .group:hover .block-link { stroke-width: 3; }
      `}</style>

      {/* Block 1 */}
      <rect
        className="block"
        x="20"
        y="80"
        width="80"
        height="80"
        rx="12"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect
        x="30"
        y="90"
        width="60"
        height="6"
        rx="3"
        fill="currentColor"
        opacity="0.25"
      />
      <rect
        x="30"
        y="105"
        width="50"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.15"
      />
      <text
        x="60"
        y="155"
        textAnchor="middle"
        fill="currentColor"
        fontSize="14"
        fontWeight="bold"
        opacity="0.4"
      >
        #1
      </text>

      {/* Connection */}
      <path
        className="block-link"
        d="M100 120 L130 120"
        stroke="currentColor"
        opacity="0.3"
      />
      <circle cx="115" cy="120" r="4" fill="currentColor" opacity="0.2" />

      {/* Block 2 */}
      <rect
        className="block"
        x="130"
        y="80"
        width="80"
        height="80"
        rx="12"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect
        x="140"
        y="90"
        width="60"
        height="6"
        rx="3"
        fill="currentColor"
        opacity="0.25"
      />
      <rect
        x="140"
        y="105"
        width="50"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.15"
      />
      <text
        x="170"
        y="155"
        textAnchor="middle"
        fill="currentColor"
        fontSize="14"
        fontWeight="bold"
        opacity="0.4"
      >
        #2
      </text>

      {/* Connection */}
      <path
        className="block-link"
        d="M210 120 L240 120"
        stroke="currentColor"
        opacity="0.3"
      />
      <circle cx="225" cy="120" r="4" fill="currentColor" opacity="0.2" />

      {/* Block 3 */}
      <rect
        className="block"
        x="240"
        y="80"
        width="80"
        height="80"
        rx="12"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect
        x="250"
        y="90"
        width="60"
        height="6"
        rx="3"
        fill="currentColor"
        opacity="0.25"
      />
      <rect
        x="250"
        y="105"
        width="50"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.15"
      />
      {/* Checkmark on last block */}
      <path
        className="block-check"
        d="M270 150 L280 160 L300 140"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />

      {/* Hash indicator */}
      <text
        x="160"
        y="230"
        textAnchor="middle"
        fill="currentColor"
        fontSize="11"
        fontFamily="monospace"
        opacity="0.3"
      >
        hash: a7f2c9...
      </text>
    </svg>
  );
}
