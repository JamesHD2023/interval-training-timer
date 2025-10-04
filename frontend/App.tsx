import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Home from "./pages/Home";
import JapaneseWalking from "./pages/JapaneseWalking";
import Norwegian4x4 from "./pages/Norwegian4x4";
import CustomTimer from "./pages/CustomTimer";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/japanese-walking" element={<JapaneseWalking />} />
          <Route path="/norwegian-4x4" element={<Norwegian4x4 />} />
          <Route path="/custom" element={<CustomTimer />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}
