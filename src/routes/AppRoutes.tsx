import { Routes, Route } from "react-router-dom";
import Home from "../Components/pages/Home";
import MyReviews from "../Components/pages/MyReviews";
import PasswordResetConfirm from "../Components/pages/PasswordResetConfirm";
import Preferences from "../Components/pages/Preferences";
import Feed from "../Components/pages/Feed";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/preferences" element={<Preferences />} />
      <Route path="/my-reviews" element={<MyReviews />} />
      <Route path="/reset-password-confirm/:uidb64/:token" element={<PasswordResetConfirm />} />
      <Route path="/feed" element={<Feed />} />
    </Routes>
  );
};

export default AppRoutes;