import { Routes, Route } from "react-router-dom";
import Home from "../Components/pages/Home";
import MyReviews from "../Components/pages/MyReviews";
import Preferences from "../Components/pages/Preferences";
import Feed from "../Components/pages/Feed";
import Profile from "../Components/pages/Profile";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/preferences" element={<Preferences />} />
      <Route path="/my-reviews" element={<MyReviews />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
};

export default AppRoutes;