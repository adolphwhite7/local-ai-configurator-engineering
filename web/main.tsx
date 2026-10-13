import { createRoot } from "react-dom/client";
import App from "./App";
import "./public-shell.css";
import "./app/local-models.css";

createRoot(document.getElementById("root")!).render(<App />);
