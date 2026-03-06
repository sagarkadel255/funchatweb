export interface Friend {
  _id: string;
  username: string;
  email: string;
  profileImage?: string;
  bio?: string;
  phone?: string;
  status: "online" | "offline" | "away";
  lastSeen: string;
}

export interface FriendRequest {
  _id: string;
  senderId: Friend;
  receiverId: Friend;   // populated — used for sent requests list
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}