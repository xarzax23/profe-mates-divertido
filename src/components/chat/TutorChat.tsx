import React, { useState } from "react";

const endpoint = import.meta.env.VITE_CHAT_ENDPOINT;
const auth = import.meta.env.VITE_CHAT_AUTH;

export default function TutorChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!endpoint) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        No se puede conectar con el tutor.<br />
        Falta la variable <code>VITE_CHAT_ENDPOINT</code> en el archivo <code>.env</code>.
      </div>
    );
  }

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setMessages([...messages, { from: "user", text: input }]);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(auth ? { Authorization: auth } : {}),
        },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { from: "tutor", text: data.reply || "Sin respuesta del tutor." }]);
    } catch {
      setMessages((msgs) => [...msgs, { from: "tutor", text: "Error al conectar con el tutor." }]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <div className="tutor-chat-window" style={{ maxWidth: 400, margin: "2rem auto", border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
      <h2>Tutor Virtual</h2>
      <div style={{ minHeight: 120, marginBottom: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.from === "user" ? "right" : "left" }}>
            <b>{msg.from === "user" ? "Tú" : "Tutor"}:</b> {msg.text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && sendMessage()}
        disabled={loading}
        style={{ width: "75%", marginRight: 8 }}
        placeholder="Escribe tu pregunta..."
      />
      <button onClick={sendMessage} disabled={loading || !input.trim()}>Enviar</button>
    </div>
  );
}
