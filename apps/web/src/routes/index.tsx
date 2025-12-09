import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  useUser,
  UserButton,
} from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [token, setToken] = useState("");
  const [response, setResponse] = useState(null);

  const fetchToken = async () => {
    const newToken = await getToken({ template: "college-jwt" });
    setToken(newToken as string);
    console.log("🔥 JWT:", newToken);
  };

  const copyTokenToClipboard = async () => {
    if (!token) return alert("⚠️ Get token first!");
    await navigator.clipboard.writeText(token);
    alert("📋 Token copied to clipboard!");
  };

  const callBackend = async () => {
    if (!token) return alert("⚠️ Get token first!");

    const res = await fetch("http://localhost:3000/v1/department", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setResponse(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Protected Route Test</h1>

      <SignedIn>
        <p>Signed in as: <strong>{user?.fullName}</strong></p>

        <UserButton />

        <br /><br />

        <button onClick={fetchToken}>🔑 Get Backend Token</button>
        <button onClick={copyTokenToClipboard} style={{ marginLeft: 10 }}>
          📋 Copy Token
        </button>

        {token && (
          <textarea
            value={token}
            readOnly
            style={{
              width: "100%",
              height: "120px",
              marginTop: "15px",
              padding: "10px",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          />
        )}

        <button onClick={callBackend} style={{ marginTop: 10 }}>
          🚀 Call Protected API
        </button>

        {response && (
          <pre style={{ marginTop: 20, background: "#222", color: "white", padding: 10 }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        )}
      </SignedIn>

      <SignedOut>
        <p>You are signed out</p>
        <SignInButton />
      </SignedOut>
    </div>
  );
}
