import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Today from "./screens/Today";
import Kitchen from "./screens/Kitchen";
import Cook from "./screens/Cook";
import Scan from "./screens/Scan";
import Prep from "./screens/Prep";
import Cooking from "./screens/Cooking";
import VoiceHelp from "./screens/VoiceHelp";
import Impact from "./screens/Impact";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Today />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/cook" element={<Cook />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/prep/:recipeId" element={<Prep />} />
        <Route path="/cooking/:recipeId" element={<Cooking />} />
        <Route path="/voice" element={<VoiceHelp />} />
        <Route path="/groceries" element={<Navigate to="/kitchen" replace />} />
        <Route path="/freshness" element={<Navigate to="/kitchen?view=freshness" replace />} />
        <Route path="/recipes" element={<Navigate to="/cook" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
