import { create } from "zustand";
import axiosInstance from "../axios";

const useAuthStore = create((set, get) => ({

  user_id: localStorage.getItem("user_id") || null,
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,
  club: localStorage.getItem("club") || null,
  resetToken: null,
  loading: false,
  error: null,

  // ===========================
  // LOGIN
  // ===========================
  login: async (username, password) => {
    set({ loading: true, error: null });

    try {
      const res = await axiosInstance.post("/auth/login/", {
        username,
        password,
      });

      const token = res.data?.token || res.data?.data?.token;
      const role = res.data?.role || res.data?.data?.role;
      const user_id = res.data?.user || res.data?.data?.user_id;
      const student_id = res.data?.user || res.data?.data?.student_id;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("student_id", student_id);

      set({ user_id, token, role, loading: false });

      // Fetch club for LEAD role
      if (role === "LEAD") {
        try {
          const studentRes = await axiosInstance.get(`/students/${student_id}`, {
            headers: {
              Authorization: `Token ${token}`
            }
          });

          const club = studentRes.data?.club;

          if (club) {
            localStorage.setItem("club", club);
            set({ club });
          }
        } catch (err) {
          console.log("Could not fetch student club:", err.response?.data || err.message);
        }
      }

      return true;

    } catch (err) {
      const apiError = err.response?.data;
      let errorMessage = "Login failed";

      if (apiError) {
        if (apiError.non_field_errors) errorMessage = apiError.non_field_errors.join(", ");
        else if (apiError.detail) errorMessage = apiError.detail;
        else if (typeof apiError === "string") errorMessage = apiError;
        else errorMessage = JSON.stringify(apiError);
      }

      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  // ===========================
  // REQUEST OTP
  // ===========================
  requestOtp: async (email) => {
    set({ loading: true, error: null });

    try {
      const res = await axiosInstance.post("/auth/otp/", { email });

      const resetToken = res.data?.token?.access;

      set({ resetToken, loading: false });

      return { success: true, resetToken };

    } catch (err) {
      const apiError = err.response?.data;
      let errorMessage = "OTP request failed";

      if (apiError?.non_field_errors) {
        errorMessage = apiError.non_field_errors.join(", ");
      }

      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // ===========================
  // RESET PASSWORD
  // ===========================
  resetPassword: async (newPassword) => {
    set({ loading: true, error: null });

    try {
      const { resetToken } = get();
      const res = await axiosInstance.put("/auth/password/reset", {
        token: resetToken,
        password: newPassword,
      });

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("club");

      set({
        loading: false,
        resetToken: null,
        token: null,
        user_id: null,
        role: null,
        club: null,
      });

      return { success: true, data: res.data };

    } catch (err) {
      const apiError = err.response?.data;
      let errorMessage = "Password reset failed";

      if (apiError?.non_field_errors) {
        errorMessage = apiError.non_field_errors.join(", ");
      }

      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // ===========================
  // SIGNUP
  // ===========================
  signup: async (signupData) => {
    set({ loading: true, error: null });

    try {
      const res = await axiosInstance.post("/auth/signup/", signupData);

      const newUserToken = res.data?.data?.token;
      const newUserRole = res.data?.data?.role;
      const newUserId = res.data?.data?.user_id;

      console.log("Signup success:", res.data);

      set({ loading: false });

      return {
        success: true,
        data: { token: newUserToken, role: newUserRole, user_id: newUserId },
      };

    } catch (err) {
      console.log("Signup error response:", err.response?.data);

      set({
        error: err.response?.data?.message ||err.response?.data || "Signup failed",
        loading: false,
      });

      return {
        success: false,
        message: err.response?.data?.message||err.response?.data || "Signup failed",
        data: err.response?.data || null,
      };
    }
  },

  // ===========================
  // LOGOUT
  // ===========================
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("club");
    set({ role: null, token: null, user_id: null, club: null });
  },

}));

export default useAuthStore;
