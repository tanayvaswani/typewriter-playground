import { Server } from "socket.io";

export function setupListerner(io: Server) {
  io.on("connection", (socket) => {
    console.log(`New Connection - ${socket.id}`);

    socket.on("join-playground", (roomId: string, name: string) => {
      if (!roomId) {
        return socket.emit("error", "Invalid Room ID.");
      }

      if (!name) {
        return socket.emit("error", "Please enter a valid name.");
      }

      socket.join(roomId);
    });
  });
}
