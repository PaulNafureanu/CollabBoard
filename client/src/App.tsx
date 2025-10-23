import { useEffect, useRef } from "react";
import "./App.css";
import { socket } from "./realtime/socket";
// import getHealth from "./api";

const ROOM_ID = 1;
const USER_ID = Math.floor(Math.random() * 1e6);

function App() {
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        socket.emit("cursor_move", {
          roomId: ROOM_ID,
          userId: USER_ID,
          x: e.clientX,
          y: e.clientY,
          ts: Date.now(),
        });
      });
    };

    window.addEventListener("mousemove", onMove);

    socket.on("connect", () => {
      console.log("[client] connected", socket.id);
    });

    socket.on("cursor_move", (payload) => {
      console.log("[client] other cursor: ", payload);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      socket.off("connect");
      socket.off("cursor_move");
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Cursor test</h1>
      <p>
        Open a second tab of this page. Move the mouse in either tab and watch
        the console logs.
      </p>
      <ul>
        <li>
          Room: <b>{ROOM_ID}</b>
        </li>
        <li>
          User: <b>{USER_ID}</b>
        </li>
      </ul>
    </div>
  );
}

export default App;
