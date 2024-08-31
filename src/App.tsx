import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./@/components/shared/Layout";
import MessagePage from "./@/components/pages/MessagePage";
import HomePage from "./@/components/pages/HomePage";
import LoginPage from "./@/components/pages/LoginPage";
import SignUpPage from "./@/components/pages/SignupPage";
import { useQuery } from "@tanstack/react-query";
import PageLoader from "./@/components/Loaders/PageLoader";
import { User } from "./types/type";
import GroupMessagePage from "./@/components/pages/GroupMessagePage";
// import VideoCallPage from "./@/components/pages/VideoCallPage";
import AxiosBase from "./utils/axios";
import React, { Suspense } from "react";

// lazy loading for the video call page
const VideoCallPage = React.lazy(
  () => import("./@/components/pages/VideoCallPage")
);

export default function App() {
  const { data: authUser, isLoading } = useQuery<User>({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await AxiosBase("/api/auth/me");
        if (res.data.error) return null;
        return res.data;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    retry: false,
  });

  if (isLoading) return <PageLoader />;
  return (
    <Routes>
      <Route
        path="/login"
        element={authUser ? <Navigate to={"/"} /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={authUser ? <Navigate to={"/"} /> : <SignUpPage />}
      />
      <Route
        path="/"
        element={!authUser ? <Navigate to={"/login"} /> : <Layout />}
      >
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/messages/:id"
          element={authUser ? <MessagePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/group/:id"
          element={authUser ? <GroupMessagePage /> : <Navigate to="/login" />}
        />
      </Route>
      <Route
        path="/room/:id"
        element={
          authUser ? (
            <Suspense fallback={<PageLoader />}>
              <VideoCallPage />
            </Suspense>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
