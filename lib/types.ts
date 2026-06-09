export type User = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
};

export type Post = {
  id: string;
  authorId: string;
  prose: string;        // the AI-written description — the ONLY thing followers see
  createdAt: string;    // ISO timestamp
  replies: Reply[];
};

export type Reply = {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
};
