import api from "./axios";
import { ENDPOINTS } from "./endpoints";

export const friendApi = {
  sendRequest: (receiverId: string) =>
    api.post(ENDPOINTS.FRIEND.SEND_REQUEST, { receiverId }).then(r => r.data),

  acceptRequest: (requestId: string) =>
    api.post(ENDPOINTS.FRIEND.ACCEPT_REQUEST, { requestId }).then(r => r.data),

  rejectRequest: (requestId: string) =>
    api.post(ENDPOINTS.FRIEND.REJECT_REQUEST, { requestId }).then(r => r.data),

  cancelRequest: (requestId: string) =>
    api.delete(ENDPOINTS.FRIEND.CANCEL_REQUEST(requestId)).then(r => r.data),

  // This endpoint returns ALL requests, we'll filter client-side
  getFriendRequests: () =>
    api.get(ENDPOINTS.FRIEND.GET_ALL_REQUESTS).then(r => r.data),

  getFriends: () =>
    api.get(ENDPOINTS.FRIEND.GET_FRIENDS).then(r => r.data),

  blockUser: (userId: string) =>
    api.post(ENDPOINTS.FRIEND.BLOCK_USER, { blockId: userId }).then(r => r.data),

  unblockUser: (userId: string) =>
    api.post(ENDPOINTS.FRIEND.UNBLOCK_USER, { unblockId: userId }).then(r => r.data),

  searchUsers: (query: string) =>
    api.get(ENDPOINTS.AUTH.SEARCH_USERS, { params: { query } }).then(r => r.data),
};