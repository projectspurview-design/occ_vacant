export default function StatusBadge({ detected }) {
  return (
    <span style={{
      color: detected ? "#22c55e" : "#ec2b2bff",
      fontWeight: 600
    }}>
      {detected ? "Detected" : "Not Detected"}
    </span>
  );
}
