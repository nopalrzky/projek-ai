import { useState } from "react";

export default function STT() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3001/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setText(data.text || JSON.stringify(data));
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Speech to Text</h3>
      <input type="file" accept="audio/*" onChange={handleUpload} disabled={loading} />
      {loading && <p>Transcribing...</p>}
      {text && <div style={{ marginTop: "1rem", padding: "1rem", background: "#f0f0f0" }}>{text}</div>}
    </div>
  );
}
