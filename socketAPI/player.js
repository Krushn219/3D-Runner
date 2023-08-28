const Player = function () {
    // VARIABLES
    let PlayerId
    let PlayerSocketId
    let PlayerName
    let TotalCollectedCoconuts = 0

    this.getPlayerId = () => { return PlayerId }
    this.getPlayerSocketId = () => { return PlayerSocketId }
    this.getPlayerName = () => { return PlayerName }
    this.getTotalCollectedCoconuts = () => { return TotalCollectedCoconuts }

    this.setPlayerId = (_playerId) => { PlayerId = _playerId }
    this.setPlayerSocketId = (_playerSocketId) => { PlayerSocketId = _playerSocketId }
    this.setPlayerName = (_playerName) => { PlayerName = _playerName }
    this.setTotalCollectedCoconuts = (_totalCollectedCoconuts) => { TotalCollectedCoconuts = _totalCollectedCoconuts }
}

module.exports = Player;