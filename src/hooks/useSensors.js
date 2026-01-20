import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase";
import { decodeMinewRawToText } from "../utils/decodeMinewRaw";

export function useSensors() {
  const [sensors, setSensors] = useState([]);

  // cache so you don’t re-decode same raw again and again
  const cacheRef = useRef(new Map());

  useEffect(() => {
    const q = query(collection(db, "tags"), orderBy("lastSeen", "desc"), limit(200));
    const unsub = onSnapshot(q, (snap) => {
      const next = snap.docs.map((d) => {
        const data = { id: d.id, ...d.data() };

        const key = `${data.mac || d.id}|${data.gatewaySeq || ""}|${data.raw || ""}`;
        if (!cacheRef.current.has(key)) {
          cacheRef.current.set(key, decodeMinewRawToText(data.raw));
        }

        return {
          ...data,
          actualData: cacheRef.current.get(key), // <- NEW FIELD
        };
      });

      setSensors(next);
    });

    return () => unsub();
  }, []);

  return { sensors };
}
