import React, { useEffect, useState } from "react";
import Lobby from "./components/Lobby";
import axios from "axios";

function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    const apiBase = process.env.REACT_APP_API_BASE || "http://192.168.1.158:8080";
    axios.get(`${apiBase}/api/users`)
      .then(res => {
        if (!mounted) return;
        setPlayers(res.data || []);
      })
      .catch(err => {
        console.error("Failed to load users", err);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; }
  }, []);
  return (
    <div>
      <Lobby userList={players} loading={loading} />
    </div>
  );
}
export default App;