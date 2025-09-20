import { Routes, Route } from "react-router-dom";
import Home from "../Components/pages/Home";
import MyReviews from "../Components/pages/MyReviews";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/my-reviews" element={<MyReviews />} />
    </Routes>
  );
};

export default AppRoutes;