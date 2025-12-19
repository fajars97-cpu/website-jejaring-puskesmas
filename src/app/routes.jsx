import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";

import Home from "../pages/Home";
import Jejaring from "../pages/Jejaring";
import Perizinan from "../pages/Perizinan";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="jejaring" element={<Jejaring />} />
        <Route path="perizinan" element={<Perizinan />} />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
