import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../src/pages/login";
import Room from "../src/pages/room";
import Chat from "../src/pages/chat";
import Protected from "./components/protected";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Protected />}>
          <Route path="/" element={<Room />} />
          <Route path="/chat/:room" element={<Chat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
