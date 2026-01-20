export const getSensors = async () => {
  return [
    { name: "Temp Sensor 1", mac: "AA:BB:01", detected: true,  date: "2026-01-06", time: "10:12" },
    { name: "Temp Sensor 2", mac: "AA:BB:02", detected: false, date: "2026-01-06", time: "10:11" },
    { name: "Motion Sensor", mac: "AA:BB:03", detected: true,  date: "2026-01-06", time: "10:10" },
    { name: "Humidity",     mac: "AA:BB:04", detected: false, date: "2026-01-06", time: "10:09" },
    { name: "Pressure",     mac: "AA:BB:05", detected: true,  date: "2026-01-06", time: "10:08" },
    { name: "Gas Sensor",   mac: "AA:BB:06", detected: false, date: "2026-01-06", time: "10:07" },
    { name: "IR Sensor",    mac: "AA:BB:07", detected: true,  date: "2026-01-06", time: "10:06" }
  ];
};

export const mapSensor = async (data) => {
  console.log("Mapped sensor:", data);
};
