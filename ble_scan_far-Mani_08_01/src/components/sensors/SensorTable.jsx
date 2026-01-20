// src/components/sensors/SensorTable.jsx
import { useMemo } from "react";
import { useSensors } from "../../hooks/useSensors";

/** Extract numeric TOF from actualData (object or string). Returns number or null */
function getTof(actualData) {
  if (actualData == null) return null;

  if (typeof actualData === "object") {
    const v =
      actualData.tof ??
      actualData.TOF ??
      actualData.ToF ??
      actualData.tofValue ??
      actualData.tof_value;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  if (typeof actualData === "string") {
    try {
      const parsed = JSON.parse(actualData);
      const v = parsed?.tof ?? parsed?.TOF ?? parsed?.ToF;
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    } catch (_) {}

    const match = actualData.match(/tof\s*[:=]\s*(-?\d+(\.\d+)?)/i);
    if (match?.[1] != null) {
      const n = Number(match[1]);
      return Number.isFinite(n) ? n : null;
    }
  }

  return null;
}

export default function SensorTable() {
  const { sensors } = useSensors();

  // ✅ Logic unchanged
  // Occupied: 0 < TOF < 1
  // Vacant: else
  // Hide: no TOF
  const { occupied, vacant } = useMemo(() => {
    const occ = [];
    const vac = [];

    (sensors || []).forEach((s) => {
      const tof = getTof(s.actualData);
      if (tof == null) return; // don't display without TOF

      if (tof > 0 && tof < 1) occ.push({ ...s, _tof: tof });
      else vac.push({ ...s, _tof: tof });
    });

    return { occupied: occ, vacant: vac };
  }, [sensors]);

  const displayValue = (s) => s?.name || s?.mac || "-";
  const formatTof = (tof) => (Number.isFinite(tof) ? tof.toFixed(2) : "-");

  return (
    <div className="occupancy-grid">
      {/* OCCUPIED */}
      <section className="occupancy-panel occupancy-panel--occupied">
        <div className="occupancy-head">
          <div>
            <h3 className="occupancy-title">Occupied</h3>
            <p className="occupancy-sub">0 &lt; TOF &lt; 1</p>
          </div>
          <div className="occupancy-count">{occupied.length}</div>
        </div>

        <div className="occupancy-body">
          {occupied.length === 0 ? (
            <div className="sensor-empty">No occupied sensors.</div>
          ) : (
            <div className="sensor-box-grid">
              {occupied.map((s) => (
                <div key={s.mac || s.name} className="sensor-box">
                  <div className="sensor-box-title">{displayValue(s)}</div>
                  <div className="sensor-box-sub">TOF: {formatTof(s._tof)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* VACANT */}
      <section className="occupancy-panel occupancy-panel--vacant">
        <div className="occupancy-head">
          <div>
            <h3 className="occupancy-title">Vacant</h3>
            <p className="occupancy-sub">All other TOF values</p>
          </div>
          <div className="occupancy-count">{vacant.length}</div>
        </div>

        <div className="occupancy-body">
          {vacant.length === 0 ? (
            <div className="sensor-empty">No vacant sensors.</div>
          ) : (
            <div className="sensor-box-grid">
              {vacant.map((s) => (
                <div key={s.mac || s.name} className="sensor-box">
                  <div className="sensor-box-title">{displayValue(s)}</div>
                  <div className="sensor-box-sub">TOF: {formatTof(s._tof)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
