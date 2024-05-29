const socket = io();
const leaderboard = document.querySelector("#leaderboard");

socket.on("serverRecdMove", (data) => {
  const { sqIdx, move, moverId } = data;
  const square = document.querySelector(`[data-idx="${sqIdx}"]`);
  square.innerText = move;
  leaderboard.click();
  if (moverId !== socket.id) moveLocked = false;
});

socket.on("gameOver", (data) => {
  const { winner, message } = data;
  alert(message);
  resetBoard();
});

socket.on("updateLeaderboard", (data) => {
  const { XWins, OWins } = data;
  leaderboard.innerHTML = `X Wins: ${XWins}, O Wins: ${OWins}`;
});

const board = document.querySelector("#board");
const clickedSqs = [];

function createBoard(n) {
  for (let i = 0; i < n * n; i++) {
    const div = document.createElement("div");
    div.classList.add("square");
    div.setAttribute("data-idx", i);
    board.appendChild(div);
  }
  board.style.display = "grid";
  board.style.gridTemplateColumns = `repeat(${n},1fr)`;
  board.style.gridTemplateRows = `repeat(${n},1fr)`;
  clickedSqs.push(false);
}

function resetBoard() {
  board.innerHTML = "";
  createBoard(3);
  moveLocked = false;
}

let flag = true;
let moveLocked = false;

board.onclick = function (event) {
  const clicked = event.target;
  if (moveLocked) return alert("Not your move");
  if (!clicked.matches(".square")) return;
  const idx = clicked.getAttribute("data-idx");
  if (clickedSqs[idx]) return;
  socket.emit("playerMoved", { sqIdx: idx, moverId: socket.id });
  moveLocked = true;
};

const roomIdInput = document.querySelector("#roomId");
const createRoomBtn = document.querySelector("#createRoom");
const joinRoomBtn = document.querySelector("#joinRoom");
const roomStatus = document.querySelector("#roomStatus");

createRoomBtn.addEventListener("click", () => {
  socket.emit("createRoom");
});

joinRoomBtn.addEventListener("click", () => {
  const roomId = roomIdInput.value;
  if (roomId) {
    socket.emit("joinRoom", roomId);
  } else {
    roomStatus.textContent = "Please enter a room ID";
  }
});

socket.on("roomCreated", (roomId) => {
  roomStatus.textContent = `Room created: ${roomId}`;
});

socket.on("playerJoined", (playerId) => {
  if (playerId === socket.id) {
    roomStatus.textContent = "You joined the room";
  } else {
    roomStatus.textContent = "Another player joined the room";
  }
});

socket.on("gameStarted", () => {
  roomStatus.textContent = "Game started";
});

socket.on("roomNotAvailable", () => {
  roomStatus.textContent = "Room not available or already full";
});

createBoard(3);
