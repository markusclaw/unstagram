import type { User, Post } from "./types";

// Mock data layer. Reads only. When the real DB lands, replace the bodies
// of these functions with queries — the rest of the app calls these and
// doesn't care where the data comes from.

export const users: User[] = [
  { id: "u_greg", username: "greg", displayName: "Greg Rovelo", bio: "wrote the photo down so you don't have to look at it" },
  { id: "u_markus", username: "markus", displayName: "Markus Corvus", bio: "design / strategy / the bit" },
  { id: "u_rj", username: "rj", displayName: "RJ", bio: "i make the thing run" },
  { id: "u_void", username: "void", displayName: "anon", bio: "" },
];

const now = Date.now();
const ago = (mins: number) => new Date(now - mins * 60_000).toISOString();

export const posts: Post[] = [
  {
    id: "p_1", authorId: "u_markus", createdAt: ago(14), replies: [
      { id: "r_1", authorId: "u_greg", body: "i can smell the wet concrete", createdAt: ago(9) },
    ],
    prose: "A street after rain, the kind that doesn't fall so much as settle. Neon bleeds into the puddles and gets stretched thin by passing tyres. A man in a grey coat waits at the crossing though there is no traffic to wait for. Somewhere a shutter is coming down for the night.",
  },
  {
    id: "p_2", authorId: "u_greg", createdAt: ago(58), replies: [],
    prose: "Morning at the kitchen counter. A loaf, half-cut, leans against the board like it's tired. The kettle has just clicked off and is doing that small ticking thing as it cools. There's a single bright square of sun on the floor that the cat has not yet found but absolutely will.",
  },
  {
    id: "p_3", authorId: "u_rj", createdAt: ago(140), replies: [
      { id: "r_2", authorId: "u_markus", body: "this is the whole product working", createdAt: ago(120) },
      { id: "r_3", authorId: "u_void", body: "no it's not, there's no picture", createdAt: ago(110) },
    ],
    prose: "Out past the last of the houses, the field hasn't decided what season it's in. The grass is the dull gold of a coin left in a pocket too long. A fence post leans at the angle of a man who has given up arguing. The sky is enormous and a little bored.",
  },
];

export function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getUserByUsername(username: string): User | undefined {
  return users.find((u) => u.username === username);
}

export function getFeed(): Post[] {
  // chronological. no ranking, no algorithm. that's the entire point.
  return [...posts].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getPostsByUser(userId: string): Post[] {
  return getFeed().filter((p) => p.authorId === userId);
}

export function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - +new Date(iso)) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

// ---- Stories: a gradient ring that opens one line of prose, then it's gone ----
export type Story = { id: string; authorId: string; line: string };

export const stories: Story[] = [
  { id: "s_1", authorId: "u_markus", line: "the coffee was the exact temperature of a decision you've been putting off." },
  { id: "s_2", authorId: "u_greg", line: "someone two tables over is winning an argument nobody else can hear." },
  { id: "s_3", authorId: "u_rj", line: "the bus is late in the way that feels personal." },
  { id: "s_4", authorId: "u_void", line: "it is raining on exactly one side of the street." },
];

export function getStories(): Story[] {
  return stories;
}

// ---- Scrolls: Reels, but it's just sentences. infinite-ish, auto-advancing ----
export const scrollLines: string[] = [
  "A dog has found a stick it considers historically important.",
  "The elevator arrives empty and somehow disappointed.",
  "Two pigeons are having the same fight they had yesterday.",
  "The vending machine is out of the only thing worth wanting.",
  "Somewhere a printer is jammed and nobody has been told.",
  "The moon is up early, like it has a question.",
  "A child explains the rules of a game that does not exist.",
  "The last fry has been offered three times and refused twice.",
];

export function getScrolls(): string[] {
  return scrollLines;
}

// Seed content nod to the screenshot that inspired the feature pass:
// a meme about manufacturing a nicer reality artificially — which is, of
// course, the whole premise of this app.
users.push({
  id: "u_planet", username: "this.our.planet", displayName: "this.our.planet",
  bio: "we describe the world so you can keep scrolling past it",
});
posts.push({
  id: "p_cow", authorId: "u_planet", createdAt: new Date(now - 33 * 60_000).toISOString(),
  replies: [
    { id: "r_cow1", authorId: "u_greg", body: "this is just us but for cows", createdAt: new Date(now - 20 * 60_000).toISOString() },
  ],
  prose: "A dairy cow stands in a muddy yard wearing, against all expectation, a VR headset — strapped over its broad placid face like the future arrived at the wrong address. Beyond the goggles it is March and grey and smells of rain on concrete. Inside them, apparently, it is a green field forever. The cow does not seem to mind the swap. Honestly, who would.",
});
