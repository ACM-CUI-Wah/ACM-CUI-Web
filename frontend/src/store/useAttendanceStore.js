
import { create } from "zustand";
import axiosInstance from "../axios";

const useAttendanceStore = create((set) => ({
  meetings: [],
  students: [],
  loading: false,
  error: null,
  fetchMeetings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/meetings/");
      set({ meetings: res.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch meetings",
        loading: false,
      });
    }
  },

  createMeeting: async (meetingData) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.post("/meetings/create/", meetingData);
      set((state) => ({
        meetings: [...state.meetings, res.data],
        loading: false,
      }));
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to create meeting",
        loading: false,
      });
      throw err;
    }
  },

  updateMeeting: async (id, meetingData) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.put(`/meetings/${id}/`, meetingData);
      set((state) => ({
        meetings: state.meetings.map((m) =>
          m.id === id ? res.data : m
        ),
        loading: false,
      }));
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update meeting",
        loading: false,
      });
      throw err;
    }
  },

  deleteMeeting: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/meetings/${id}/`);
      set((state) => ({
        meetings: state.meetings.filter((m) => m.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete meeting",
        loading: false,
      });
      throw err;
    }
  },

  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/students/");
      set({ students: res.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch students",
        loading: false,
      });
    }
  },
}));

export default useAttendanceStore;
