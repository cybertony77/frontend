import { useRouter } from "next/router";

export default function BackToDashboard({ style = {}, className = "", text = "Back to Dashboard", href = "/dashboard" }) {
  const router = useRouter();
  return (
    <button
      className={`back-btn ${className}`}
      style={{
        background: "linear-gradient(90deg, #6c757d 0%, #495057 100%)",
        color: "white",
        border: "none",
        borderRadius: 8,
        padding: "10px 20px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        fontSize: "1rem",
        display: "flex",
        alignItems: "center",
        gap: 8,
        ...style
      }}
      onClick={() => href ? router.push(href) : router.back()}
    >
      <span style={{ fontSize: "1.2em", marginRight: 6 }}>←</span> {text}
    </button>
  );
} 