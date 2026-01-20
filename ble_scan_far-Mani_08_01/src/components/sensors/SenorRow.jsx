// SensorRow.jsx  (make sure you use this, NOT <tr>)
export default function SensorRow({ sensor }) {
  const { name, mac, rssi, actualData, status, date, time } = sensor;

  return (
    <div
      className={`sensor-row ${
        status === "IN"
          ? "row-green-soft"
          : status === "OUT"
          ? "row-red-soft"
          : ""
      }`}
    >
      <div className="cell">{name ?? "-"}</div>
      <div className="cell mono">{mac ?? "-"}</div>
      <div className="cell">{rssi ?? "-"}</div>
      <div className="cell">
        {typeof actualData === "object"
          ? JSON.stringify(actualData)
          : actualData ?? "-"}
      </div>
      <div className="cell">{status ?? "-"}</div>
      <div className="cell">{date ?? "-"}</div>
      <div className="cell">{time ?? "-"}</div>
    </div>
  );
}
