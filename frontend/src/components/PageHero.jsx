import './PageHero.css';

function NetworkGraphic() {
  const nodes = [
    [420, 40], [500, 90], [460, 150], [560, 60], [600, 130],
    [660, 40], [700, 110], [540, 180], [620, 200], [700, 170],
    [760, 90], [780, 40],
  ];
  const edges = [
    [0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [5, 6], [4, 7],
    [7, 8], [8, 9], [9, 10], [10, 11], [6, 10], [4, 9],
  ];

  return (
    <svg className="page-hero-network" viewBox="0 0 800 260" preserveAspectRatio="xMidYMid meet">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]} y1={nodes[a][1]}
          x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="#60a5fa"
          strokeWidth="1.5"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x} cy={y} r={i === 5 ? 7 : 4}
          fill={i === 5 ? '#f59e0b' : '#60a5fa'}
        />
      ))}
    </svg>
  );
}

export default function PageHero({ title, description }) {
  return (
    <div className="page-hero">
      <NetworkGraphic />
      <div className="page-hero-content">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}