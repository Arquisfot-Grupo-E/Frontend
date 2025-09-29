import { Routes, Route } from "react-router-dom";
import Home from "../Components/pages/Home";
import MyReviews from "../Components/pages/MyReviews";
import Preferences from "../Components/pages/Preferences";
import Feed from "../Components/pages/Feed";
import Profile from "../Components/pages/Profile";
import ProfileEdit from "../Components/pages/ProfileEdit";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/preferences" element={<Preferences />} />
      <Route path="/my-reviews" element={<MyReviews />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/edit" element={<ProfileEdit />} />
    </Routes>
  );
};

export default AppRoutes;