// src/lib/store/friendstore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getSocket } from "@/lib/utils/socket";
import toast from "react-hot-toast";

// Import your exact types (adjust path if needed)
import { Friend, FriendRequest } from "@/lib/types/friend";

// SentRequest can just extend FriendRequest (no need for separate interface unless you add unique fields)
type SentRequest = FriendRequest;

// ── Store Interface ─────────────────────────────────────────────────────

interface FriendStore {
  // Data
  friends: Friend[];
  friendRequests: FriendRequest[]; // received requests
  sentRequests: SentRequest[];     // sent requests
  blockedUsers: string[];          // blocked user IDs

  // Setters
  setFriends: (friends: Friend[]) => void;
  setFriendRequests: (requests: FriendRequest[]) => void;
  setSentRequests: (requests: SentRequest[]) => void;
  setBlockedUsers: (ids: string[]) => void;

  // Mutations
  addFriend: (friend: Friend) => void;
  removeFriend: (userId: string) => void;
  updateFriendStatus: (userId: string, status: Friend["status"]) => void; // ADD THIS

  addFriendRequest: (request: FriendRequest) => void;
  removeFriendRequest: (requestId: string) => void;

  addSentRequest: (request: SentRequest) => void;
  removeSentRequest: (requestId: string) => void;

  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;

  // Helpers
  isFriend: (userId: string) => boolean;
  hasPendingRequest: (userId: string) => boolean;
  hasSentRequest: (userId: string) => boolean;
  isBlocked: (userId: string) => boolean;

  clearAll: () => void;
}

// ── Store Creation ──────────────────────────────────────────────────────

export const useFriendStore = create<FriendStore>()(
  persist(
    (set, get) => {
      // ── Real-time Socket Listeners ────────────────────────────────────
      const setupSocketListeners = () => {
        const socket = getSocket();
        if (!socket) return;

        // New incoming friend request (receiver side)
        socket.on("newFriendRequest", (newRequest: FriendRequest) => {
          console.log("[FriendStore] New friend request received:", newRequest);

          set((state) => {
            // Prevent duplicate
            if (state.friendRequests.some((r) => r._id === newRequest._id)) {
              return state;
            }
            return {
              friendRequests: [newRequest, ...state.friendRequests],
            };
          });

          const senderName =
            typeof newRequest.senderId === "object" && newRequest.senderId?.username
              ? newRequest.senderId.username
              : "Someone";

          toast.success(`New friend request from ${senderName}!`);
        });

        // Friend request status update (accepted/rejected/cancelled)
        socket.on("friendRequestUpdate", (update: { requestId: string; status: FriendRequest["status"] }) => {
          console.log("[FriendStore] Friend request update:", update);

          set((state) => ({
            friendRequests: state.friendRequests.filter((r) => r._id !== update.requestId),
            sentRequests: state.sentRequests.filter((r) => r._id !== update.requestId),
          }));
        });

        // User online/offline status change — with guard against non-array
        socket.on("user:status", (data: { userId: string; status: Friend["status"] }) => {
          set((state) => {
            // Guard: if friends is not an array, reset to empty array
            if (!Array.isArray(state.friends)) {
              console.warn("[FriendStore] 'friends' was not an array — resetting to []");
              return { friends: [] };
            }

            return {
              friends: state.friends.map((f) =>
                f._id === data.userId ? { ...f, status: data.status } : f
              ),
            };
          });
        });
      };

      // Only setup listeners in browser
      if (typeof window !== "undefined") {
        setupSocketListeners();
      }

      return {
        // ── Initial State ─────────────────────────────────────────────────
        friends: [],
        friendRequests: [],
        sentRequests: [],
        blockedUsers: [],

        // ── Setters ───────────────────────────────────────────────────────
        setFriends: (friends) => set({ friends: Array.isArray(friends) ? friends : [] }),
        setFriendRequests: (requests) => set({ friendRequests: requests || [] }),
        setSentRequests: (requests) => set({ sentRequests: requests || [] }),
        setBlockedUsers: (ids) => set({ blockedUsers: ids || [] }),

        // ── Friend Mutations ──────────────────────────────────────────────
        addFriend: (friend) =>
          set((state) => ({
            friends: [...(Array.isArray(state.friends) ? state.friends : []), friend],
          })),

        removeFriend: (userId) =>
          set((state) => ({
            friends: Array.isArray(state.friends)
              ? state.friends.filter((f) => f._id !== userId)
              : [],
          })),

        // ADD THIS NEW METHOD
        updateFriendStatus: (userId, status) =>
          set((state) => ({
            friends: Array.isArray(state.friends)
              ? state.friends.map((f) =>
                  f._id === userId ? { ...f, status } : f
                )
              : [],
          })),

        // ── Received Requests ─────────────────────────────────────────────
        addFriendRequest: (request) =>
          set((state) => {
            if (state.friendRequests.some((r) => r._id === request._id)) return state;
            return {
              friendRequests: [request, ...(state.friendRequests || [])],
            };
          }),

        removeFriendRequest: (requestId) =>
          set((state) => ({
            friendRequests: state.friendRequests.filter((r) => r._id !== requestId),
          })),

        // ── Sent Requests ─────────────────────────────────────────────────
        addSentRequest: (request) =>
          set((state) => {
            if (state.sentRequests.some((r) => r._id === request._id)) return state;
            return {
              sentRequests: [request, ...(state.sentRequests || [])],
            };
          }),

        removeSentRequest: (requestId) =>
          set((state) => ({
            sentRequests: state.sentRequests.filter((r) => r._id !== requestId),
          })),

        // ── Block / Unblock ───────────────────────────────────────────────
        blockUser: (userId) =>
          set((state) => ({
            blockedUsers: [...new Set([...(state.blockedUsers || []), userId])],
            friends: Array.isArray(state.friends)
              ? state.friends.filter((f) => f._id !== userId)
              : [],
          })),

        unblockUser: (userId) =>
          set((state) => ({
            blockedUsers: (state.blockedUsers || []).filter((id) => id !== userId),
          })),

        // ── Helpers ───────────────────────────────────────────────────────
        isFriend: (userId) => (get().friends || []).some((f) => f._id === userId),

        hasPendingRequest: (userId) =>
          (get().friendRequests || []).some(
            (r) => (typeof r.senderId === "string" ? r.senderId : r.senderId?._id) === userId
          ),

        hasSentRequest: (userId) =>
          (get().sentRequests || []).some(
            (r) => (typeof r.receiverId === "string" ? r.receiverId : r.receiverId?._id) === userId
          ),

        isBlocked: (userId) => (get().blockedUsers || []).includes(userId),

        // ── Clear All ─────────────────────────────────────────────────────
        clearAll: () =>
          set({
            friends: [],
            friendRequests: [],
            sentRequests: [],
            blockedUsers: [],
          }),
      };
    },
    {
      name: "friend-storage", // persist to localStorage
      partialize: (state) => ({
        friends: state.friends,
        blockedUsers: state.blockedUsers,
      }),
    }
  )
);