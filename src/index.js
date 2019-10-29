import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


let next = false;
let reset = false;
let won = false;
let rewindSpot = [];

class Move extends React.Component {
  handleClick = () => {
    this.props.rewindToMove(this.props.index);
  }

  render() {
    return (
      <div>
        <div className="move-text">
          {this.props.value}
        </div>
        <button className="go-to-move" onClick={this.handleClick}>
          -
        </button>
      </div>
    );
  }
}

class Square extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clicked: '',
    };
  }

  reset() {
    this.setState({
      clicked: '',
    });
  }

  componentDidUpdate() {
    if (reset) {
      this.reset();
      return;
    }
    if (rewindSpot.length > 0) {
      if (!rewindSpot.some(row => row.includes('' + this.props.value))) {
        this.reset();
      }
    }
  }

  handleClick = () => {
    if (won || this.state.clicked !== '') {
      return;
    }
    next = !next;
    const player = next ? 'X' : 'O';
    this.setState({
      clicked: player,
    });
    this.props.nextMove(this.props.value, player);
  }

  render() {
    return (
      <button className="square" onClick={this.handleClick}>
        {this.state.clicked}
      </button>
    );
  }
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      next: 'X',
    };
  }

  reset() {
    this.setState({
      next: 'X',
    });
  }

  componentDidUpdate() {
    if (reset) {
      this.reset();
      return;
    }
    if (rewindSpot.length > 0) {
      this.setState({
        next: rewindSpot[rewindSpot.length - 1][0] === 'X' ? 'O' : 'X',
      });
      next = rewindSpot[rewindSpot.length - 1][0] === 'X' ? true : false;
    }
  }

  nextMove = (square, player) => {
    this.setState({
      next: player === 'X' ? 'O' : 'X',
    });
    this.props.makeMove(square, player);
  }

  render() {
    return (
      <div>
        <div className="status">Next player: {this.state.next}</div>
        <div className="board-row">
          <Square value={0} nextMove={this.nextMove} />
          <Square value={1} nextMove={this.nextMove} />
          <Square value={2} nextMove={this.nextMove} />
        </div>
        <div className="board-row">
          <Square value={3} nextMove={this.nextMove} />
          <Square value={4} nextMove={this.nextMove} />
          <Square value={5} nextMove={this.nextMove} />
        </div>
        <div className="board-row">
          <Square value={6} nextMove={this.nextMove} />
          <Square value={7} nextMove={this.nextMove} />
          <Square value={8} nextMove={this.nextMove} />
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  victoryString = '';

  constructor(props) {
    super(props);
    this.state = {
      turn: 0,
      prev: [],
    };
  }

  reset() {
    this.setState({
      turn: 0,
      prev: [],
    });
  }

  checkWin(vals) {
    if (
    (vals.some(row => row.includes('0'))
    && vals.some(row => row.includes('4'))
    && vals.some(row => row.includes('8')))
    ||
    (vals.some(row => row.includes('2'))
    && vals.some(row => row.includes('4'))
    && vals.some(row => row.includes('6')))
    ||
    (vals.some(row => row.includes('0'))
    && vals.some(row => row.includes('3'))
    && vals.some(row => row.includes('6')))
    ||
    (vals.some(row => row.includes('1'))
    && vals.some(row => row.includes('4'))
    && vals.some(row => row.includes('7')))
    ||
    (vals.some(row => row.includes('2'))
    && vals.some(row => row.includes('5'))
    && vals.some(row => row.includes('8')))
    ||
    (vals.some(row => row.includes('0'))
    && vals.some(row => row.includes('1'))
    && vals.some(row => row.includes('2')))
    ||
    (vals.some(row => row.includes('3'))
    && vals.some(row => row.includes('4'))
    && vals.some(row => row.includes('5')))
    ||
    (vals.some(row => row.includes('6'))
    && vals.some(row => row.includes('7'))
    && vals.some(row => row.includes('8')))
    ) {
      return true;
    }
  }

  componentDidUpdate() {
    if (reset) {
      this.reset();
      reset = false;
      next = false;
    }

    rewindSpot = [];

    const Xvals = this.state.prev.filter(value => value.includes('X'));
    const Ovals = this.state.prev.filter(value => value.includes('O'));

    if (this.checkWin(Xvals)) {
      alert('Win for X!');
      won = true;
    } else if(this.checkWin(Ovals)) {
      alert('Win for O!');
      won = true;
    } else if (this.state.prev.length === 9) {
      alert('Draw!');
    }

    // console.log('updated the game!');
  }

  rewindToMove = (index) => {
    this.victoryString = '';
    won = false;

    let history = [];

    for (let i = 0 ; i < index - 1; i++) {
      history.push(this.state.prev[this.state.prev.length - i - 1]);
    }

    for (const move of history) {
      rewindSpot.push(move.split(' in square '));
    }

    if (rewindSpot.length === 0) {
      reset = true;
    }

    this.setState({
      turn: history.length,
      prev: [...history.reverse()],
    });

    // console.log(...history);
    // console.log(...rewindSpot);
  }

  makeMove = (square, player) => {
    this.setState({
      turn: this.state.turn + 1,
      prev: [player + ' in square ' + square, ...this.state.prev],
    })
  }

  render() {
    const previousMoves = this.state.prev.map((move, i) => {
      return (
      <li className="move" key={i}>
        <Move index={this.state.prev.length - i} value={move} rewindToMove={this.rewindToMove} />
      </li>
      );
    });

    return (
      <div className="game">
        <div className="game-board">
          <Board makeMove={this.makeMove} />
          <Clock />
        </div>
        <div className="game-info">
          <div className="turn">Turn: {this.state.turn}</div>
          <div className="history">
            History:
            <ol reversed>{previousMoves}</ol>
          </div>
        </div>
      </div>
    );
  }
}

class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      load: new Date(),
      date: new Date(),
    };
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date: new Date(),
    });
  }

  render() {
    return (
      <div>
        <p>Time spent: {Math.floor((this.state.date.getTime() - this.state.load.getTime())/1000)}s.</p>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
