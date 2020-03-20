import React from 'react';
import Board from "./Board";

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            height: 8,
            width: 8,
            mines: 10,
            gamePlayedCount: 0,
            isGameLose: 0,
            isGameWon: 0
        }
    }

    createGame(event) {
        const [height, width, mines] = event.target.value.split(',').map(x => parseInt(x));
        this.setState({
            height: height,
            width: width,
            mines: mines,
            gamePlayedCount: this.state.gamePlayedCount + 1
        });
    }

    newGame() {
        this.setState({
            gamePlayedCount: this.state.gamePlayedCount + 1
        });
    }

    render() {
        const {height, width, mines} = this.state;
        return <div className="game">
            <div className="menu">
                <button className="menu-button" onClick={() => this.newGame()}>
                    new game
                </button>
                <br />
                <label className="white-text">Difficulty level:</label>
                <br />
                <select className="menu-button" onChange={value => this.createGame(value)}>
                    <option value={[8, 8, 10]}>easy</option>
                    <option value={[14, 14, 30]}>normal</option>
                    <option value={[20, 20, 80]}>hard</option>
                </select>
            </div>
            <div className="board">
                <Board
                    key={this.state.gamePlayedCount}
                    height={height}
                    width={width}
                    mines={mines}
                />
            </div>

        </div>
    }
}
export default Game;