import React from 'react';
import Brick from "./Brick";

export default class Board extends React.Component {
    constructor(props) {
        super(props);
        const {height, width, mines} = props;
        const bricks = this.bricksNumberInitialize(height, width);
        this.state = {
            bricksInGame: bricks,
            minesLeft: mines,
            fieldsToDiscover: (height * width) - mines,
            gameOver: false,
        };
        this.planMinesOnBoard(bricks, mines);
    }

    bricksNumberInitialize(height, width) {
        return [...Array(height)].map((_, row) =>
            [...Array(width)].map((_, column) => ({
                row: row,
                col: column,
                isMine: false,
                isDiscovered: false,
                isFlagged: false,
                neighborMinesCount: 0,
                isGameLost: false,
            }))
        );
    }

    planMinesOnBoard(bricksInGame, minesNumber) {
        let plantedBombs = 0;

        while (plantedBombs < minesNumber) {
            let randomRow = bricksInGame[Math.floor(Math.random() * bricksInGame.length)];
            let randomBrick = randomRow[Math.floor(Math.random() * randomRow.length)];
            if (!randomBrick.isMine) {
                randomBrick.isMine = true;
                this.increaseNumberToBrick(bricksInGame, randomBrick.row, randomBrick.col);
                plantedBombs++;
            }
        }
    }

    increaseNumberToBrick(bricksInGame, row, col) {
        this.getCoordinateOfNeighbor(row, col).forEach(([row, col]) => {
            bricksInGame[row][col].neighborMinesCount++;
        });
    }

    getCoordinateOfNeighbor(row, col) {
        return [
            [row, col + 1],
            [row, col - 1],
            //down
            [row - 1, col],
            [row - 1, col + 1],
            [row - 1, col - 1],
            //up
            [row + 1, col],
            [row + 1, col + 1],
            [row + 1, col - 1],
        ].filter(([row, col]) => this.cutWrongCoordinate(row, col));
    }

    cutWrongCoordinate(row, col) {
        return row >= 0 && col >= 0 && row < this.props.height && col < this.props.width
    }

    selectedMine(brick) {
        const shouldBeDiscover = chosenBrick => chosenBrick.isDiscovered ||
            (chosenBrick.row === brick.row && chosenBrick.col === brick.col);

        let newBoardState = this.state.bricksInGame.map(rows =>
            rows.map(brick => ({
                ...brick,
                isDiscovered: shouldBeDiscover(brick),
                isGameLost: true
            })));

        this.setState({bricksInGame: newBoardState});
    }

    discoverBricks(row, col) {
        this.discoverBricksByCoordinate(this.getCoordinateToDiscover(row, col));
    }

    discoverBricksByCoordinate(jsonCoords) {
        this.setState({
            bricksInGame: this.state.bricksInGame.map(rows =>
                rows.map(brick => jsonCoords.has(JSON.stringify([brick.row, brick.col])) ?
                    {...brick, isDiscovered: true} : brick
                ))
        });
    }

    getCoordinateToDiscover(row, col) {
        const coordinatesToDiscover = new Set();

        const allConnectedBrick = (r, c) => {
            coordinatesToDiscover.add(JSON.stringify([r, c]));
            if (this.state.bricksInGame[r][c].neighborMinesCount === 0) {
                for (let [row, col] of this.getCoordinateOfNeighbor(r, c)) {
                    let coords = JSON.stringify([row, col]);
                    if (!coordinatesToDiscover.has(coords) && this.canBeDiscovered(row, col)) {
                        allConnectedBrick(row, col)
                    }
                }
            }
        };

        allConnectedBrick(row, col);

        return coordinatesToDiscover;
    };

    canBeDiscovered(row, col) {
        return this.state.bricksInGame[row][col].isFlagged === false &&
            this.state.bricksInGame[row][col].isDiscovered === false;
    }

    onClickHandle(brick) {
        if (this.isGameFinished() || brick.isDiscovered || brick.isFlagged) return;

        if (brick.isMine) {
            this.selectedMine(brick);
        } else {
            this.discoverBricks(brick.row, brick.col);
        }
    }

    onContextMenuHandle(event, brick) {
        event.preventDefault();
        if (this.isGameFinished() || brick.isDiscovered) return;

        brick.isFlagged ? brick.isFlagged = false : brick.isFlagged = true;
        let updatedMinesToFlag = brick.isFlagged ? this.state.minesLeft - 1 : this.state.minesLeft + 1;
        this.setState({
            minesLeft: updatedMinesToFlag
        });
    }

    isGameLost = () => [].concat(...this.state.bricksInGame)
        .some(brick => brick.isMine === true && brick.isDiscovered === true);

    isGameWon = () => this.countDiscoveredFields() === this.state.fieldsToDiscover;

    isGameFinished = () => this.isGameLost() || this.isGameWon();

    countDiscoveredFields = () => [].concat(...this.state.bricksInGame).filter(brick => brick.isDiscovered).length;

    gameStatus = () => this.isGameLost() ? "You lose..." : this.isGameWon() ? "You win!" : "Game in progress";

    renderBricks(bricks) {
        return bricks.map(rows =>
            rows.map(brick =>
                <div key={`r${brick.row}c${brick.col}`}>
                    <Brick
                        row={brick.row}
                        col={brick.col}
                        isMine={brick.isMine}
                        isDiscovered={brick.isDiscovered}
                        isFlagged={brick.isFlagged}
                        neighborMinesCount={brick.neighborMinesCount}
                        isGameLost={brick.isGameLost}
                        onClick={() => {
                            this.onClickHandle(brick)
                        }}
                        onContextMenu={(e) => {
                            this.onContextMenuHandle(e, brick)
                        }}
                    />
                    {brick.col === this.props.width - 1 ? <div className="end-row"/> : ""}
                </div>
            )
        )
    };

    render() {
        return <div className="board-container">
            <div className="score-menu">
                <div className="game-status">
                    <label>{this.gameStatus()}</label>
                </div>
                <div className="flag-counter">
                    <label>Bombs left: {this.state.minesLeft}</label>
                </div>
            </div>
            <div className="game-board">
                <div>
                    {this.renderBricks(this.state.bricksInGame)}
                </div>
            </div>
        </div>
    }
}