import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

// MG6 uses mac like: "328fd986d36b" (no ":"), lowercase.
// This normalizes any input (with ":" or "-" etc) into that format.
function normalizeMac(input) {
  return (input || "")
    .trim()
    .toLowerCase()
    .replace(/[^0-9a-f]/g, ""); // removes ":" "-" spaces, etc.
}

export default function SensorForm() {
  const [mac, setMac] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const macNorm = normalizeMac(mac);
    const nameNorm = (name || "").trim();

    if (macNorm.length !== 12) {
      setMsg("MAC must be 12 hex characters (example: 328fd986d36b).");
      return;
    }
    if (!nameNorm) {
      setMsg("Please enter a name.");
      return;
    }

    try {
      setSaving(true);

      // Save mapping into tags/{mac}
      await setDoc(
        doc(db, "tags", macNorm),
        {
          mac: macNorm,
          name: nameNorm,
          nameUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setMsg("Saved ✅");
      setMac("");
      setName("");
    } catch (err) {
      console.error(err);
      setMsg("Failed to save ❌ (check Firestore rules)");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div style={{ marginBottom: 12 }}>
        <label>MAC</label>
        <input
          value={mac}
          onChange={(e) => setMac(e.target.value)}
          placeholder="328fd986d36b"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Front Door Tag"
        />
      </div>

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Mapping"}
      </button>

      {msg ? <p style={{ marginTop: 10 }}>{msg}</p> : null}
    </form>
  );
}
