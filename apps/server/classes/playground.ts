import { Server, Socket } from "socket.io";

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

  setupListeners(socket: Socket) {}

  joinPlayers(id: string, name: string, socket: Socket) {
    if (this.playgroundStatus === "in-progress") {
      return socket.emit(
        "error",
        "Game is running, please wait for it to end."
      );
    }

    this.players.push({ id, name, score: 0 });

    this.io.to(this.gameId).emit("player-joined", {
      id,
      name,
      score: 0,
    });

    socket.emit("players", this.players);

    socket.emit("new-host", this.playgroundHost);

    this.setupListeners(socket);
  }
}
