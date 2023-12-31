var _ = require('lodash');
const Room = function (io) {
    let roomId
    let bidAmount
    let roomCreatorSocketId

    let roomFull = false
    let gameStart = false

    let app = require('..');
    let Player = require('./player');

    let playerObjectList = [];
    let playerData = [];

    this.getRoomId = () => { return roomId }
    this.getBidAmount = () => { return bidAmount }
    this.getRoomCreatorSocketId = () => { return roomCreatorSocketId }
    this.getRoomFull = () => { return roomFull }
    this.getGameStart = () => { return gameStart }
    this.getPlayerObjectList = () => { return playerObjectList }

    this.setRoomId = (_roomId) => { roomId = _roomId }
    this.setBidAmount = (_bidAmount) => { bidAmount = _bidAmount }
    this.setRoomCreatorSocketId = (_roomCreatorSocketId) => { roomCreatorSocketId = _roomCreatorSocketId }

    this.connectPlayer = (socket, _playerName) => {
        let findPlayerSocketId = _.find(playerObjectList, _player => _player.getPlayerSocketId() == socket.id)
        let playerId = Date.now().toString();
        if (!findPlayerSocketId) {
            let socketId = socket.id;
            let newPlayer = new Player();
            newPlayer.setPlayerId(playerId);
            newPlayer.setPlayerSocketId(socketId);
            newPlayer.setPlayerName(_playerName);
            playerObjectList.push(newPlayer);
            if (playerObjectList.length == 2) {
                roomFull = true
                gameStart = true
                console.log('----room full status ---- : ', roomFull);
            } else {
                roomFull = false
                gameStart = false
                console.log('----room full status ---- : ', roomFull);
            }
            console.log('TotalPlayers :', playerObjectList.length);
            playerData.push({ socketId: socket.id, playerId: playerId, playerName: _playerName });
            console.log({ roomId, playerData: playerData });
            if (playerObjectList.length == 2) {
                socket.to(playerData[0].socketId).emit('onOpponentFound', JSON.stringify({
                    playerName: playerData[1].playerName,
                }))
                socket.emit('onOpponentFound', JSON.stringify({
                    playerName: playerData[0].playerName,
                    bidAmount: bidAmount
                }))
                socket.to(playerData[0].socketId).emit('newGameAction', JSON.stringify({
                    playerId: playerData[0] ? playerData[0].playerId : null,
                    opponentId: playerData[1] ? playerData[1].playerId : null,
                }))
                socket.emit('newGameAction', JSON.stringify({
                    playerId: playerData[1] ? playerData[1].playerId : null,
                    opponentId: playerData[0] ? playerData[0].playerId : null,
                }))
            }
        } else {
            io.to(findPlayerSocketId.getPlayerSocketId()).emit('playerInRoomAction', JSON.stringify({ status: false, message: 'Already In Room!!' }));
        }

        socket.on('disconnect', (reason) => {
            console.log(socket.id, '------ disconnect socket id ------', reason);
            let findPlayerInObjList = _.find(playerObjectList, _player => _player.getPlayerSocketId() == socket.id);
            let findPlayerData;
            if (findPlayerInObjList) {
                findPlayerData = _.find(playerData, _player => _player.playerId == findPlayerInObjList.getPlayerId());
            }
            disconnectFunc(findPlayerInObjList, findPlayerData);
        });

        socket.on('disconnectManually', (_playerData) => {
            console.log(socket.id, '------ disconnect manually ------');
            const { playerId } = JSON.parse(_playerData);
            let findPlayerInObjList = _.find(playerObjectList, _player => _player.getPlayerId() == playerId);
            let findPlayerData = _.find(playerData, _player => _player.playerId == playerId);

            disconnectFunc(findPlayerInObjList, findPlayerData);
        });

        socket.on('onCoconutCollected', (_playerData) => {
            let { playerId, totalCollectedCoconuts } = JSON.parse(_playerData);
            let opponentPlayer = _.find(playerObjectList, _player => _player.getPlayerId() != playerId);
            socket.to(opponentPlayer.getPlayerSocketId()).emit('onCoconutCollectedAction', JSON.stringify({ playerId, totalCollectedCoconuts }));
        });


        socket.on("playerLose", (_playerData) => {
            let { playerId } = JSON.parse(_playerData);
            let opponentPlayer = _.find(playerObjectList, _player => _player.getPlayerId() != playerId);
            socket.to(opponentPlayer.getPlayerSocketId()).emit('playerWinAction', JSON.stringify({ message: "You Win." }));
        });
    }

    const disconnectFunc = (findPlayerInObjList, findPlayerData) => {
        playerObjectList.splice(playerObjectList.indexOf(findPlayerInObjList), 1);
        playerData.splice(playerData.indexOf(findPlayerData), 1);
        if (playerObjectList.length == 2) { roomFull = true } else { roomFull = false }
        if (findPlayerInObjList) {
            io.in(roomId).emit('disconnectAction', JSON.stringify({ status: false, playerId: findPlayerInObjList.getPlayerId(), playerName: findPlayerInObjList.getPlayerName() }));
        }
        if (playerObjectList.length == 0) { deleteRoom() }
    }

    const deleteRoom = () => {
        const roomObjectList = app.roomObjectList;
        let findRoom = _.find(roomObjectList, _room => _room.getRoomId() == roomId);
        if (findRoom) { roomObjectList.splice(roomObjectList.indexOf(findRoom), 1) }
        console.log("After Disconnect Total Rooms : ", roomObjectList.length);
    }
}

module.exports = Room;
