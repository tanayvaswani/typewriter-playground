import { Server, Socket } from "socket.io";

import { generateParagraph } from "../utils/generate-paragraph";
import { playgrounds } from "../setup-listerners";

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

  setupListeners(socket: Socket) {
    socket.on("start-game", async () => {
      if (this.playgroundStatus === "in-progress") {
        return socket.emit(
          "error",
          "Playground has already started, please wait for it to end."
        );
      }

      if (this.playgroundHost === socket.id) {
        return socket.emit("error", "You don't have access to start the game.");
      }

      for (const player of this.players) {
        player.score = 0;
      }

      this.io.to(this.gameId).emit("players", this.players);

      this.playgroundStatus = "in-progress";

      const paragraph = await generateParagraph();

      this.paragraph = paragraph;

      this.io.to(this.gameId).emit("game-started", paragraph);

      setTimeout(() => {
        this.playgroundStatus = "finished";
        this.io.to(this.gameId).emit("game-finished");
        this.io.to(this.gameId).emit("players", this.players);
      }, 60000);
    });

    socket.on("player-type", (typed: string) => {
      if (this.playgroundStatus === "in-progress") {
        return socket.emit(
          "error",
          "Playground has already started, please wait for it to end."
        );
      }

      const splittedParagraph = this.paragraph.split(" ");
      const splittedTypedParagraph = typed.split(" ");

      let score = 0;

      for (let i = 0; i < splittedTypedParagraph.length; i++) {
        if (splittedTypedParagraph[i] === splittedParagraph[i]) {
          score++;
        } else {
          break;
        }
      }

      const player = this.players.find((player) => player.id === socket.id);

      if (player) {
        player.score = score;
      }

      this.io.to(this.gameId).emit("player-score", { id: socket.id, score });
    });

    socket.on("leave", () => {
      if (socket.id == this.playgroundHost) {
        this.players = this.players.filter((player) => player.id !== socket.id);

        if (this.players.length !== 0) {
          this.playgroundHost = this.players[0].id;
          this.io.to(this.gameId).emit("new-host", this.playgroundHost);
          this.io.to(this.gameId).emit("player-left", socket.id);
        } else {
          playgrounds.delete(this.gameId);
        }
      }

      socket.leave(this.gameId);
      this.players = this.players.filter((player) => player.id !== socket.id);
      this.io.to(this.gameId).emit("player-left", socket.id);
    });
  }

  joinPlayers(id: string, name: string, socket: Socket) {
    if (this.playgroundStatus === "in-progress") {
      return socket.emit(
        "error",
        "Playground has already started, please wait for it to end."
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
