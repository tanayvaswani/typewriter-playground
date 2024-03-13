export type Player = {
  id: string;
  name: string;
  score: number;
};

export type PlayerScore = {
  id: string;
  score: number;
};

export type PlaygroundStatus = "not-started" | "in-progress" | "finished";

export type PlaygroundProps = {
  name: string;
  playgroundId: string;
};
