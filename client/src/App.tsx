import { useEffect, useState } from "react";
import "./App.css";
import getHealth from "./api";

function App() {
  const [health, setHealth] = useState<object>({});

  useEffect(() => {
    getHealth().then(setHealth).catch(console.error);
  }, []);

  return (
    <>
      <h1>CollabBoard</h1>
      <p>{JSON.stringify(health, null, 2)}</p>
    </>
  );
}

export default App;
