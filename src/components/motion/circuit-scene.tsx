// Decorative geometry is computed once; no canvas, timers or render loop.
const points = Array.from({ length: 64 }, (_, index) => {
  const y = 1 - (2 * index) / 63;
  const radius = Math.sqrt(1 - y * y);
  const angle = index * 2.399963;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const perspective = 3.6 / (3.6 + z);
  return {
    x,
    y,
    z,
    screenX: 300 + x * 210 * perspective,
    screenY: 250 + y * 200 * perspective,
  };
});
const edges = points.flatMap((point, index) =>
  points
    .map((other, target) => ({
      target,
      distance:
        (point.x - other.x) ** 2 +
        (point.y - other.y) ** 2 +
        (point.z - other.z) ** 2,
    }))
    .filter((edge) => edge.target > index)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .filter((edge) => edge.distance < 0.5)
    .map((edge) => [index, edge.target]),
);
export function CircuitScene() {
  return (
    <svg
      className="circuit-canvas"
      viewBox="0 0 600 500"
      aria-hidden="true"
      focusable="false"
      data-testid="circuit-scene"
    >
      <g stroke="var(--scene-line)" strokeWidth="0.8" opacity="0.3">
        {edges.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={points[a].screenX}
            y1={points[a].screenY}
            x2={points[b].screenX}
            y2={points[b].screenY}
          />
        ))}
      </g>
      <g fill="var(--scene-accent)" opacity="0.55">
        {points.map((point, index) => (
          <circle key={index} cx={point.screenX} cy={point.screenY} r={1.8} />
        ))}
      </g>
    </svg>
  );
}
