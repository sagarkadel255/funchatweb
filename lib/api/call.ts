import api from "./axios";
import { ENDPOINTS } from "./endpoints";

export const callApi = {
  initiateCall: async (data: { receiverId: string; type: "voice" | "video" }) => {
    try {
      console.log("📞 Sending call request with data:", data);
      
      // ✅ Map both fields to what backend expects
      const response = await api.post(ENDPOINTS.CALL.INITIATE, {
        recipientId: data.receiverId,
        callType: data.type,  // This is the fix! Send as callType, not type
        type: data.type       // Send both to be safe
      });
      
      console.log("📞 Call response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("initiateCall error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to initiate call",
        data: null
      };
    }
  },

  acceptCall: async (callId: string) => {
    try {
      const response = await api.post(ENDPOINTS.CALL.ACCEPT, { callId });
      return response.data;
    } catch (error: any) {
      console.error("acceptCall error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to accept call",
        data: null
      };
    }
  },

  rejectCall: async (callId: string) => {
    try {
      const response = await api.post(ENDPOINTS.CALL.REJECT, { callId });
      return response.data;
    } catch (error: any) {
      console.error("rejectCall error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject call",
        data: null
      };
    }
  },

  endCall: async (callId: string) => {
    try {
      const response = await api.post(ENDPOINTS.CALL.END, { callId });
      return response.data;
    } catch (error: any) {
      console.error("endCall error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to end call",
        data: null
      };
    }
  },

  clearStaleCalls: async () => {
    try {
      const response = await api.post(ENDPOINTS.CALL.CLEAR_STALE);
      return response.data;
    } catch (error: any) {
      console.error("clearStaleCalls error:", error.response?.data || error.message);
      return { success: false, data: { cleared: 0 } };
    }
  },

  getCallHistory: async () => {
    try {
      const response = await api.get(ENDPOINTS.CALL.HISTORY);
      return response.data;
    } catch (error: any) {
      console.error("getCallHistory error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to load call history",
        data: []
      };
    }
  },

  getMissedCalls: async () => {
    try {
      const response = await api.get(ENDPOINTS.CALL.MISSED);
      return response.data;
    } catch (error: any) {
      console.error("getMissedCalls error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to load missed calls",
        data: []
      };
    }
  },
};