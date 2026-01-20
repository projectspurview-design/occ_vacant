/**
 * MG6 -> Firebase Cloud Function -> Firestore
 *
 * MG6 sends JSON array like:
 * [
 *   {"gateway":"ac233ffb3d2f","timestamp":1767698182133,"seq":3028},
 *   {"mac":"328fd986d36b","addr_type":"random","timestamp":1767698183033,"rssi":-53,"raw":"..."},
 *   ...
 * ]
 */

const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Choose closest region to you (optional)
setGlobalOptions({ region: "asia-south1", maxInstances: 10 });

exports.mg6 = onRequest(async (req, res) => {
  // MG6 needs 200 OK to continue sending
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const payload = normalizeBody(req);

    if (!Array.isArray(payload) || payload.length === 0) {
      return res.status(400).send("Invalid payload: expected JSON array");
    }

    const header = payload[0] || {};
    const gateway = String(header.gateway || "").trim();
    const gwTsMs = toNumber(header.timestamp);
    const seq = toNumber(header.seq);

    if (!gateway) {
      return res.status(400).send("Missing gateway in first element");
    }

    const remote =
      (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "";

    // Rest items are tag objects
    const tags = payload
      .slice(1)
      .filter((x) => x && typeof x === "object" && x.mac);

    const receivedAt = admin.firestore.FieldValue.serverTimestamp();
    const gwTimestamp =
      gwTsMs != null ? admin.firestore.Timestamp.fromMillis(gwTsMs) : null;

    // 1) Update gateway latest status
    const gwRef = db.collection("gateways").doc(gateway);

    // 2) Update latest tag status per MAC in tags collection
    // IMPORTANT: Firestore batch limit is 500 writes.
    // We do: 1 write for gateway + N writes for tags => keep N <= 499
    const maxTags = 499;
    const tagsLimited = tags.slice(0, maxTags);

    const batch = db.batch();

    batch.set(
      gwRef,
      {
        gateway,
        lastSeen: receivedAt,
        lastRemote: remote,
        lastSeq: seq ?? null,
        lastGatewayTimestamp: gwTimestamp,
        lastPacketCount: tags.length, // original count
      },
      { merge: true }
    );

    for (const t of tagsLimited) {
      // MG6 gives mac as hex string without colon, e.g. "328fd986d36b"
      const mac = String(t.mac).toLowerCase();
      const addrType = t.addr_type ? String(t.addr_type) : "";
      const rssi = toNumber(t.rssi);
      const tagTsMs = toNumber(t.timestamp);
      const tagTimestamp =
        tagTsMs != null ? admin.firestore.Timestamp.fromMillis(tagTsMs) : null;
      const raw = t.raw ? String(t.raw) : "";

      const tagRef = db.collection("tags").doc(mac);

      batch.set(
        tagRef,
        {
          mac,
          addrType,
          rssi: rssi ?? null,
          raw,
          gateway,
          gatewaySeq: seq ?? null,
          tagTimestamp,
          lastSeen: receivedAt,
        },
        { merge: true }
      );
    }

    await batch.commit();

    // Optional logging
    logger.info("MG6 packet saved", {
      gateway,
      seq,
      tagsReceived: tags.length,
      tagsStored: tagsLimited.length,
      remote,
    });

    return res.status(200).send("OK");
  } catch (e) {
    logger.error("MG6 ingest failed", e);
    return res.status(500).send("Server Error");
  }
});

// -------- helpers --------
function normalizeBody(req) {
  // If content-type is application/json, body is usually already parsed
  if (Array.isArray(req.body)) return req.body;

  // If body came as string
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      // fallthrough
    }
  }

  // rawBody fallback
  const raw = req.rawBody ? req.rawBody.toString("utf8") : "";
  return raw ? JSON.parse(raw) : null;
}

function toNumber(v) {
  if (v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
