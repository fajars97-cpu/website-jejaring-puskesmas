import { HashRouter } from "react-router-dom";
import AppRoutes from "./app/routes";

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
