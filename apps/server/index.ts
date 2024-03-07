import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 8080;

// Might need to have express server in future
// in that case, we're going with this approach
// of having httpServer beforehand.
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // All origins
    methods: ["GET", "POST"], // Allowed methods
  },
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
