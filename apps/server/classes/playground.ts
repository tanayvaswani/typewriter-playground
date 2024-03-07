import { Server } from "socket.io";

export class Playground {
  playgroundStatus: "not-started" | "in-progress" | "finished";
  gameId: string;
  players: { id: string; score: number; name: string }[];
  io: Server;
  playgroundHost: string;
  paragraph: string;

  constructor(id: string, io: Server, host: string) {
    this.gameId = id;
    this.io = io;
    this.playgroundHost = host;

    this.players = [];
    this.playgroundStatus = "not-started";
    this.paragraph = "";
  }
}
