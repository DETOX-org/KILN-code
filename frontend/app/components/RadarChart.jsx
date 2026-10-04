'use client';

import React from 'react';

export default function RadarChart({
  metrics = [
    { label: 'Correctness', value: 96, max: 100 },
    { label: 'Time Efficiency', value: 92, max: 100 },
    { label: 'Space Efficiency', value: 88, max: 100 },
    { label: 'Code Readability', value: 94, max: 100 },
    { label: 'Edge Coverage', value: 90, max: 100 }
  ],
  size = 280
}) {
  const center = size / 2;
  const radius = (size / 2) - 42;
  const totalAxes = metrics.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Grid levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index, valueRatio) => {
    const angle = angleSlice * index - Math.PI / 2;
    const x = center + radius * valueRatio * Math.cos(angle);
    const y = center + radius * valueRatio * Math.sin(angle);
    return { x, y };
  };

  // Polygon points
  const pointsString = metrics
    .map((m, i) => {
      const ratio = Math.min(1, Math.max(0.1, m.value / m.max));
      const { x, y } = getCoordinates(i, ratio);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.05" />
          </radialGradient>
          <linearGradient id="polygonStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>

        {/* Concentric Web Grid */}
        {levels.map((level, lvlIdx) => {
          const gridPoints = metrics
            .map((_, i) => {
              const { x, y } = getCoordinates(i, level);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polygon
              key={`grid-${lvlIdx}`}
              points={gridPoints}
              fill={lvlIdx === levels.length - 1 ? 'rgba(255,255,255,0.02)' : 'none'}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axes Lines & Axis Labels */}
        {metrics.map((metric, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          const labelCoords = getCoordinates(i, 1.24);

          return (
            <g key={`axis-${i}`}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeDasharray="2,2"
              />
              <text
                x={labelCoords.x}
                y={labelCoords.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--ink-secondary)"
                fontSize="10.5"
                fontFamily="var(--font-mono)"
                fontWeight="500"
              >
                {metric.label}
              </text>
            </g>
          );
        })}

        {/* Data Shape */}
        <polygon
          points={pointsString}
          fill="url(#radarGlow)"
          stroke="url(#polygonStroke)"
          strokeWidth="2.2"
          style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))' }}
        />

        {/* Data Points */}
        {metrics.map((m, i) => {
          const ratio = Math.min(1, Math.max(0.1, m.value / m.max));
          const { x, y } = getCoordinates(i, ratio);

          return (
            <circle
              key={`pt-${i}`}
              cx={x}
              cy={y}
              r="4.5"
              fill="#38BDF8"
              stroke="#0B0F17"
              strokeWidth="2"
            />
          );
        })}
      </svg>

      {/* Metrics Summary Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        marginTop: '14px',
        width: '100%',
        textAlign: 'center'
      }}>
        {metrics.map((m, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--line-subtle)',
              borderRadius: 'var(--r-sm)',
              padding: '6px 4px'
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
              {m.label.split(' ')[0]}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: m.value >= 90 ? 'var(--status-accepted)' : 'var(--status-pending)', fontFamily: 'var(--font-mono)' }}>
              {m.value}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
