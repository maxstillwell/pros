type BallisticPoint = {
  range: number;
  dropCm: number;
  velocityMs: number;
};

type BallisticProfile = {
  name: string;
  load: string;
  colour: string;
  notes: string;
  points: BallisticPoint[];
};

const ranges = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

const profiles: BallisticProfile[] = [
  {
    name: ".22 LR",
    load: "40 gr high velocity style load",
    colour: "#8f5f25",
    notes:
      "Included for scale only. This cartridge is strongly affected by wind and is not a normal 1,000 m choice.",
    points: [
      { range: 100, dropCm: 0, velocityMs: 285 },
      { range: 200, dropCm: -72, velocityMs: 240 },
      { range: 300, dropCm: -250, velocityMs: 210 },
      { range: 400, dropCm: -560, velocityMs: 190 },
      { range: 500, dropCm: -1000, velocityMs: 174 },
      { range: 600, dropCm: -1560, velocityMs: 160 },
      { range: 700, dropCm: -2250, velocityMs: 149 },
      { range: 800, dropCm: -3080, velocityMs: 140 },
      { range: 900, dropCm: -4050, velocityMs: 133 },
      { range: 1000, dropCm: -5200, velocityMs: 127 },
    ],
  },
  {
    name: ".223 Rem",
    load: "55 gr sporting load",
    colour: "#2f6f73",
    notes:
      "Light recoil and common availability, but wind and retained energy become limiting factors at longer distance.",
    points: [
      { range: 100, dropCm: 0, velocityMs: 850 },
      { range: 200, dropCm: -9, velocityMs: 760 },
      { range: 300, dropCm: -36, velocityMs: 675 },
      { range: 400, dropCm: -85, velocityMs: 595 },
      { range: 500, dropCm: -163, velocityMs: 520 },
      { range: 600, dropCm: -278, velocityMs: 455 },
      { range: 700, dropCm: -440, velocityMs: 395 },
      { range: 800, dropCm: -660, velocityMs: 345 },
      { range: 900, dropCm: -945, velocityMs: 305 },
      { range: 1000, dropCm: -1300, velocityMs: 275 },
    ],
  },
  {
    name: ".308 Win",
    load: "168 gr match or hunting style load",
    colour: "#465c35",
    notes:
      "A common benchmark cartridge with broad rifle and ammunition support.",
    points: [
      { range: 100, dropCm: 0, velocityMs: 745 },
      { range: 200, dropCm: -10, velocityMs: 690 },
      { range: 300, dropCm: -39, velocityMs: 638 },
      { range: 400, dropCm: -91, velocityMs: 588 },
      { range: 500, dropCm: -175, velocityMs: 540 },
      { range: 600, dropCm: -298, velocityMs: 495 },
      { range: 700, dropCm: -475, velocityMs: 452 },
      { range: 800, dropCm: -714, velocityMs: 412 },
      { range: 900, dropCm: -1025, velocityMs: 376 },
      { range: 1000, dropCm: -1410, velocityMs: 344 },
    ],
  },
  {
    name: "6.5 Creedmoor",
    load: "140 gr high BC style load",
    colour: "#b55a28",
    notes:
      "Often valued for efficient long-range performance and moderate recoil.",
    points: [
      { range: 100, dropCm: 0, velocityMs: 765 },
      { range: 200, dropCm: -8, velocityMs: 718 },
      { range: 300, dropCm: -31, velocityMs: 673 },
      { range: 400, dropCm: -72, velocityMs: 630 },
      { range: 500, dropCm: -135, velocityMs: 589 },
      { range: 600, dropCm: -225, velocityMs: 549 },
      { range: 700, dropCm: -348, velocityMs: 512 },
      { range: 800, dropCm: -511, velocityMs: 477 },
      { range: 900, dropCm: -722, velocityMs: 445 },
      { range: 1000, dropCm: -990, velocityMs: 415 },
    ],
  },
  {
    name: ".300 Win Mag",
    load: "180 gr magnum hunting style load",
    colour: "#10271a",
    notes:
      "Higher velocity and retained speed, usually with more recoil and ammunition cost.",
    points: [
      { range: 100, dropCm: 0, velocityMs: 835 },
      { range: 200, dropCm: -7, velocityMs: 784 },
      { range: 300, dropCm: -27, velocityMs: 735 },
      { range: 400, dropCm: -62, velocityMs: 688 },
      { range: 500, dropCm: -116, velocityMs: 643 },
      { range: 600, dropCm: -191, velocityMs: 600 },
      { range: 700, dropCm: -296, velocityMs: 559 },
      { range: 800, dropCm: -434, velocityMs: 520 },
      { range: 900, dropCm: -612, velocityMs: 484 },
      { range: 1000, dropCm: -840, velocityMs: 450 },
    ],
  },
];

function formatDrop(value: number) {
  return value === 0 ? "0" : value.toLocaleString("en-AU");
}

function pointPath(points: BallisticPoint[], min: number, max: number) {
  const width = 680;
  const height = 260;
  const left = 42;
  const right = 22;
  const top = 22;
  const bottom = 34;
  const xSpan = 900;
  const ySpan = max - min || 1;

  return points
    .map((point) => {
      const x = left + ((point.range - 100) / xSpan) * (width - left - right);
      const y =
        top +
        ((max - point.dropCm) / ySpan) * (height - top - bottom);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function DropChartCanvas({
  chartProfiles,
  min,
}: {
  chartProfiles: BallisticProfile[];
  min: number;
}) {
  const max = 0;
  const yTicks = [0, Math.round(min / 2), min];

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox="0 0 680 260"
        className="h-auto w-full min-w-[40rem]"
        role="img"
        aria-label="Approximate drop in centimetres from a 100 m zero"
      >
        <rect width="680" height="260" fill="#fbfaf6" rx="6" />
        {yTicks.map((tick) => {
          const y = 22 + ((max - tick) / (max - min || 1)) * 204;
          return (
            <g key={tick}>
              <line
                x1="42"
                x2="658"
                y1={y}
                y2={y}
                stroke="#d7d2c7"
                strokeDasharray="4 5"
              />
              <text x="12" y={y + 4} fontSize="11" fill="#536055">
                {formatDrop(tick)}
              </text>
            </g>
          );
        })}
        {ranges.map((range) => {
          const x = 42 + ((range - 100) / 900) * 616;
          return (
            <g key={range}>
              <line
                x1={x}
                x2={x}
                y1="22"
                y2="226"
                stroke="#e8e3d8"
                strokeWidth="1"
              />
              <text
                x={x}
                y="246"
                textAnchor="middle"
                fontSize="10"
                fill="#536055"
              >
                {range}
              </text>
            </g>
          );
        })}
        {chartProfiles.map((profile) => (
          <polyline
            key={profile.name}
            points={pointPath(profile.points, min, max)}
            fill="none"
            stroke={profile.colour}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
        ))}
      </svg>
    </div>
  );
}

function DropChart({
  chartProfiles,
  title,
  min,
}: {
  chartProfiles: BallisticProfile[];
  title: string;
  min: number;
}) {
  return (
    <div className="rounded-md border border-forest-900/10 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-forest-900">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-forest-900/58">
        Approximate drop in centimetres from a 100 m zero.
      </p>
      <div className="mt-4">
        <DropChartCanvas chartProfiles={chartProfiles} min={min} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {chartProfiles.map((profile) => (
          <span
            key={profile.name}
            className="inline-flex items-center gap-2 text-xs font-semibold text-forest-900/72"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: profile.colour }}
            />
            {profile.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function IndividualCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {profiles.map((profile) => {
        const min = Math.min(...profile.points.map((point) => point.dropCm));

        return (
          <div
            key={profile.name}
            className="rounded-md border border-forest-900/10 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <h3 className="text-xl font-semibold text-forest-900">
                  {profile.name}
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase text-clay">
                  {profile.load}
                </p>
              </div>
              <p className="text-sm font-semibold text-forest-900">
                100-1,000 m
              </p>
            </div>
            <div className="mt-4">
              <DropChartCanvas chartProfiles={[profile]} min={min} />
            </div>
            <p className="mt-3 text-sm leading-6 text-forest-900/68">
              {profile.notes}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function DataTable({
  title,
  unit,
  field,
}: {
  title: string;
  unit: string;
  field: "dropCm" | "velocityMs";
}) {
  return (
    <div className="rounded-md border border-forest-900/10 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-forest-900">{title}</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-forest-900/10 text-forest-900/62">
            <tr>
              <th className="py-3 pr-4 font-semibold">Range</th>
              {profiles.map((profile) => (
                <th key={profile.name} className="py-3 pr-4 font-semibold">
                  {profile.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranges.map((range) => (
              <tr
                key={range}
                className="border-b border-forest-900/10 last:border-b-0"
              >
                <td className="py-3 pr-4 font-semibold text-forest-900">
                  {range} m
                </td>
                {profiles.map((profile) => {
                  const point = profile.points.find(
                    (item) => item.range === range,
                  );
                  const value = point?.[field] ?? 0;

                  return (
                    <td key={profile.name} className="py-3 pr-4">
                      {field === "dropCm"
                        ? formatDrop(value)
                        : value.toLocaleString("en-AU")}{" "}
                      {unit}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CommonCalibreBallisticsChart() {
  const centreFireProfiles = profiles.filter(
    (profile) => profile.name !== ".22 LR",
  );
  const centreFireMin = Math.min(
    ...centreFireProfiles.flatMap((profile) =>
      profile.points.map((point) => point.dropCm),
    ),
  );

  return (
    <section className="grid gap-8">
      <div className="rounded-md border border-clay/25 bg-stone p-5">
        <p className="text-sm font-semibold uppercase text-clay">
          Chart assumptions
        </p>
        <div className="mt-4 grid gap-4 text-sm leading-6 text-forest-900/72 md:grid-cols-3">
          <p>
            Zero: 100 metres. Drop values show approximate centimetres below the
            100 m zero line.
          </p>
          <p>
            Loads: representative factory-style loads only, not a promise of
            exact performance from any rifle.
          </p>
          <p>
            Use: education and comparison. Confirm all real data on an approved
            range with safe procedures.
          </p>
        </div>
      </div>

      <DropChart
        chartProfiles={centreFireProfiles}
        title="Centre-fire trajectory comparison"
        min={centreFireMin}
      />

      <div>
        <h2 className="text-2xl font-semibold text-forest-900">
          Individual trajectory charts
        </h2>
        <p className="mt-2 text-sm leading-6 text-forest-900/68">
          Each chart uses its own scale so the curve shape remains readable.
        </p>
        <div className="mt-5">
          <IndividualCharts />
        </div>
      </div>

      <DataTable
        title="Approximate drop table"
        unit="cm"
        field="dropCm"
      />
      <DataTable
        title="Approximate remaining velocity table"
        unit="m/s"
        field="velocityMs"
      />

      <div className="rounded-md border border-forest-900/10 bg-white p-5 text-sm leading-6 text-forest-900/70 shadow-sm">
        <p className="font-semibold text-forest-900">Important note</p>
        <p className="mt-2">
          These figures are general website education only. They are not legal,
          hunting, firearms safety or ballistic advice. PROS members must follow
          all applicable laws, licence conditions, range rules, landholder
          requirements and society safety standards.
        </p>
      </div>
    </section>
  );
}
