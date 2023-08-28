const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// API 1
app.get("/players/", async (request, response) => {
  const playersQuery = `select * From cricket_team`;
  const playersArray = await db.all(playersQuery);
  return response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

// API 2 Add the player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `Insert Into cricket_team(player_name, jersey_number, role) values('${playerName}','${jerseyNumber}','${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  const player_id = dbResponse.lastID;
  response.send("Player Added to Team");
});

// API 3 Returns  the player using Player_id

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const PlayerDetails = request.body;
  const PlayerDetailsQuery = `Select *From cricket_team where player_id = '${playerId}';`;
  const playersArray = await db.get(PlayerDetailsQuery);
  response.send(playersArray);
});

// API 4 Update the player Details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});
// API 5 Delete player Details
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const DeletePlayerQuery = `DELETE From cricket_team WHERE player_id = ${playerId};`;
  await db.run(DeletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
