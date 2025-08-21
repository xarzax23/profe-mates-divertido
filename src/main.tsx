import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CourseView from "./pages/CourseView";
import Index from "./pages/Index";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/cursos/:grade/:topic" element={<CourseView />} />
        {/* Puedes agregar aquí más rutas, como el índice de cursos por grado, etc. */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
