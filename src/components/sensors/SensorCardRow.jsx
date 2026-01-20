export default function SensorCardRow({ sensor }) {
  const { name, mac, rssi, actualData, status, date, time } = sensor;

  return (
    <div className="occ-row">
      <div className="occ-cell">{name ?? "-"}</div>
      <div className="occ-cell mono">{mac ?? "-"}</div>
      <div className="occ-cell">{rssi ?? "-"}</div>
      <div className="occ-cell">
        {typeof actualData === "object"
          ? JSON.stringify(actualData)
          : actualData ?? "-"}
      </div>
      <div className="occ-cell">{status ?? "-"}</div>
      <div className="occ-cell">{date ?? "-"}</div>
      <div className="occ-cell">{time ?? "-"}</div>
    </div>
  );
}
