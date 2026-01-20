  import advlibble from "advlib-ble";
  import manufacturers from "advlib-ble-manufacturers";
  import { Buffer } from "buffer";

  // Some bundlers need Buffer available
  if (typeof window !== "undefined" && !window.Buffer) {
    window.Buffer = Buffer;
  }

  const LIBRARIES = [manufacturers];

  // base64 (or base64url) -> Uint8Array
  function base64ToBytes(b64) {
    if (!b64) return null;

    // handle base64url too
    let s = String(b64).trim().replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4 !== 0) s += "=";

    const bin = atob(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function bytesToHex(bytes) {
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  function pickFirst(obj, keys) {
    for (const k of keys) {
      if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
    }
    return undefined;
  }

  // Convert decoded object into a short readable text for your table cell
  function toDisplayText(decoded) {
    if (!decoded) return "-";

    // advlib-ble usually returns advData properties directly or under advData
    const adv = decoded.advData || decoded;

    // Manufacturer Specific Data often becomes an array
    const msdArr = Array.isArray(adv.manufacturerSpecificData)
      ? adv.manufacturerSpecificData
      : [];

    // Find Minew entry (company code 0x0639) if present
    const minew =
      msdArr.find(
        (x) =>
          x?.companyIdentifierCode === 0x0639 ||
          String(x?.companyName || "").toLowerCase().includes("minew")
      ) || null;

    const src = minew || adv;

    // Try common field names (library may output slightly different keys)
    const distance =
      pickFirst(src, [
        "distance",
        "tofDistance",
        "range",
        "distanceMm",
        "distanceCM",
      ]) ?? pickFirst(adv, ["distance", "tofDistance", "range"]);

    const occupancy =
      pickFirst(src, [
        "occupancy",
        "occupied",
        "isOccupied",
        "presence",
        "motion",
        "pir",
        "pirMotion",
      ]) ?? pickFirst(adv, ["occupancy", "presence", "motion"]);

    const battery =
      pickFirst(src, ["batteryPercentage", "battery", "batteryLevel"]) ??
      pickFirst(adv, ["batteryPercentage", "battery"]);

    // If we found at least one “real” value, show it neatly
    const parts = [];
    if (distance !== undefined) parts.push(`ToF: ${distance}`);
    if (occupancy !== undefined)
      parts.push(`PIR: ${occupancy ? "motion" : "no motion"}`);
    if (battery !== undefined) parts.push(`Bat: ${battery}`);

    if (parts.length) return parts.join(" | ");

    // fallback: show a compact JSON (avoid huge stuff)
    const small = {};
    Object.keys(src || {})
      .filter((k) => !["raw", "manufacturerSpecificData", "serviceData"].includes(k))
      .slice(0, 6)
      .forEach((k) => (small[k] = src[k]));

    return Object.keys(small).length ? JSON.stringify(small) : "-";
  }

  export function decodeMinewRawToText(rawBase64) {
    try {
      const bytes = base64ToBytes(rawBase64);
      if (!bytes || bytes.length < 3) return "-";

      // Your raw starts with 0x02 0x01 0x06 => adv payload, so isPayloadOnly:true
      const payloadHex = bytesToHex(bytes);

      const decoded = advlibble.process(payloadHex, LIBRARIES, {
        isPayloadOnly: true,
        ignoreProtocolOverhead: true,
      });

      return toDisplayText(decoded);
    } catch (e) {
      console.warn("decodeMinewRawToText failed:", e);
      return "-";
    }
  }
