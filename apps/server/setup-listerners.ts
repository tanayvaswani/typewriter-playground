import { Server } from "socket.io";

import { Playground } from "./classes/playground";

// Map to keep the track of active
// playgrounds, in a key-value pair
// <string, Playground> = roomId & Playground Objects' instance
const playgrounds = new Map<string, Playground>();

export function setupListerner(io: Server) {
  io.on("connection", (socket) => {
    console.log(`New Connection - ${socket.id}`);

    socket.on("join-playground", (roomId: string, name: string) => {
      if (!roomId) return socket.emit("error", "Invalid Room ID.");
      if (!name) return socket.emit("error", "Please enter a valid name.");

      socket.join(roomId);

      if (playgrounds.has(roomId)) {
        const playground = playgrounds.get(roomId);

        if (!playground) {
          return socket.emit("error", "Playground doesn't exists");
        }

        playground.joinPlayers(socket.id, name, socket);
      } else {
        const playground = new Playground(roomId, io, socket.id);
        playgrounds.set(roomId, playground);

        playground.joinPlayers(socket.id, name, socket);
      }
    });
  });
}
