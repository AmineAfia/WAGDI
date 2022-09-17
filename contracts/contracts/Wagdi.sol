// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

contract Wagdi {
    enum Selection {
        ROCK,
        PAPER,
        SCISSORS
    }

    uint8 private constant selection_length = 2;

    enum State {
        FIRST_COMMIT,
        FIRST_REVEAL,
        FINISHED
    }

    struct Player {
        address addr;
        bytes32 commitment;
        Selection reveal;
    }

    struct Game {
        uint256 gameId;
        Player player1;
        Player player2;
        uint256 deadline;
        State state;
    }

    struct PlayerBalance {
        uint256 stakedBalance;
        uint256 withdrawBalance;
    }

    mapping(uint256 => Game) public games;
    mapping(address => PlayerBalance) public balances;

    uint256 internal gameID;
    uint256 internal constant DEADLINE = 15 minutes;
    uint256 public constant INITIAL_STAKE = 0.001 ether;
    uint256 public constant CUT = INITIAL_STAKE / 2;

    Player public player1;
    Player public player2;

    error NotEnoughStake();
    error GameExpired();
    error WrongState();
    error YouCantPlayAgainstYourself();
    error YouAreNotAllowedToCall();
    error WrongSelection();

    // create game:
    // one player creates game, game has uniqe id, player1 transfers token and pass selection param to contract
    // emit event: GameCreated(id, timestamp, sender)
    function createGame(bytes32 _commitment) public payable {
        if (msg.value != INITIAL_STAKE) revert NotEnoughStake();
        balances[msg.sender].stakedBalance += msg.value;
        Game storage game = games[gameID];

        game.gameId = gameID;
        game.player1.addr = msg.sender;
        game.player1.commitment = _commitment;
        game.deadline = block.timestamp + DEADLINE;
        game.state = State.FIRST_COMMIT;

        emit GameCreated(
            gameID,
            block.timestamp,
            game.deadline,
            msg.sender,
            game.state
        );

        gameID++;
    }

    // join game by id:
    // player2 joins game, player2 transfers token and pass selection param to contract
    // emit event: GameJoined(id, timestamp, sender)
    // TODO; check check for correctness of selection
    function joinGame(
        uint256 _gameId,
        Selection _selection,
        bytes memory _passphrase
    ) public payable {
        if (msg.value != INITIAL_STAKE) revert NotEnoughStake();
        if (!validateSelection(_selection)) revert WrongSelection();
        balances[msg.sender].stakedBalance += msg.value;

        Game storage game = games[_gameId];

        if (block.timestamp > game.deadline) revert GameExpired();
        if (game.state != State.FIRST_COMMIT) revert WrongState();
        if (msg.sender == game.player1.addr)
            revert YouCantPlayAgainstYourself();

        game.player2.addr = msg.sender;
        game.player2.commitment = keccak256(
            abi.encodePacked(_selection, _passphrase)
        );
        game.deadline = block.timestamp + DEADLINE;
        game.state = State.FIRST_REVEAL;
        game.player2.reveal = _selection;

        emit GameJoined(
            _gameId,
            block.timestamp,
            game.deadline,
            msg.sender,
            game.state
        );
    }

    // reveal:
    // player1 passes passphrase and gameId to contract
    // player2 passes passphrase and gameId to contract + check who won, update amounts
    // TODO: selection must exist
    function reveal(
        uint256 _gameId,
        Selection _selection,
        bytes memory _passphrase
    ) public {
        Game storage game = games[_gameId];

        if (block.timestamp > game.deadline) revert GameExpired();
        if (game.state != State.FIRST_REVEAL) revert WrongState();
        if (msg.sender != game.player1.addr) revert YouAreNotAllowedToCall();
        if (!validateSelection(_selection)) revert WrongSelection();

        address winner;
        address loser;

        bytes32 commitment = keccak256(
            abi.encodePacked(_selection, _passphrase)
        );

        if (commitment != game.player1.commitment) {
            // player1 loses
            winner = game.player2.addr;
            loser = game.player1.addr;

            balances[winner].withdrawBalance += CUT;

            
            balances[loser].withdrawBalance -= CUT;
            balances[address(this)].withdrawBalance += INITIAL_STAKE;
        } else {
            // who won
            game.player1.reveal = _selection;
            if (game.player1.reveal == game.player2.reveal) {
                // nobody won
                balances[game.player1.addr] -= CUT;
                balances[game.player2.addr] -= CUT;
                balances[address(this)] += INITIAL_STAKE;
                winner = address(this);
            } else {
                (bool pl1, ) = evaluateGame(
                    game.player1.reveal,
                    game.player2.reveal
                );

                game.state = State.FINISHED;

                if (pl1) {
                    winner = game.player1.addr;
                    loser = game.player2.addr;
                } else {
                    winner = game.player2.addr;
                    loser = game.player1.addr;
                }

                balances[winner] += CUT;
                balances[loser] -= CUT;
                balances[address(this)] += INITIAL_STAKE;
            }
        }

        game.state = State.FINISHED;

        emit GameResult(
            _gameId,
            block.timestamp,
            game.deadline,
            winner,
            game.state
        );
    }

    function validateSelection(Selection _selection)
        internal
        view
        returns (bool)
    {
        return (uint8(_selection) <= selection_length);
    }

    function evaluateGame(Selection _selection1, Selection _selection2)
        internal
        pure
        returns (bool, bool)
    {
        if (_selection1 == Selection.ROCK && _selection2 == Selection.SCISSORS)
            return (true, false);
        if (_selection1 == Selection.ROCK && _selection2 == Selection.PAPER)
            return (false, true);
        if (_selection1 == Selection.PAPER && _selection2 == Selection.ROCK)
            return (true, false);
        if (_selection1 == Selection.PAPER && _selection2 == Selection.SCISSORS)
            return (false, true);
        if (_selection1 == Selection.SCISSORS && _selection2 == Selection.ROCK)
            return (false, true);
        if (_selection1 == Selection.SCISSORS && _selection2 == Selection.PAPER)
            return (true, false);
    }

    // withdraw:
    // player1 can donate on withdraw, player2 can donate on withdraw

    // donate:
    // anyone can call donate - donates money from donation pool

    // endGame:
    // if one playe not reveals or reveals a wrong passphrase, the game is ended and the other player wins
    // can be called after time X

    event GameCreated(
        uint256 gameId,
        uint256 timestamp,
        uint256 deadline,
        address player1,
        State state
    );
    event GameJoined(
        uint256 gameId,
        uint256 timestamp,
        uint256 deadline,
        address player2,
        State state
    );
    event GameResult(
        uint256 gameId,
        uint256 timestamp,
        uint256 deadline,
        address winner,
        State state
    );
}
