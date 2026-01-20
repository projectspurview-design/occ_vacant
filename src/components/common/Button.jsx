import LottieSpinner from "./LottieSpinner";
import "./button.css";

export default function Button({
  children,
  loading = false,
  disabled = false,
  type = "button",
  onClick
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${loading ? "btn-loading" : ""}`}
    >
      {loading ? (
        <>
          <LottieSpinner size={26} />
          <span className="btn-text">Processing</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
