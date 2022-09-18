// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Address.sol";

contract Wagdi {
    using Address for address payable;

    enum Selection {
        ROCK,
        PAPER,
        SCISSORS,
        LIZARD,
        SPOCK
    }

    uint8 private constant selection_length = 4;

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
    error NotEnoughBalance();
    error GameNotExpired();
    error GameHasEnded();

    address public immutable DONATION_ADDRESS;

    constructor(address donation) {
        DONATION_ADDRESS = donation;
    }

    // create game:
    // one player creates game, game has uniqe id, player1 transfers token and pass selection param to contract
    // emit event: GameCreated(id, timestamp, sender)
    function createGame(bytes32 _commitment) public payable returns(uint256){
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

        return game.gameId;
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

            // pl1: staked 1 eth
            // pl2: staked 1 eth
            // pl1 loses the 1 eth
            // pl2 wins 0.5 eth and 0.5 eth goes to donation

            removeGameStake(game);

            // add to winner withdraw balance:
            balances[winner].withdrawBalance += INITIAL_STAKE + CUT;
            balances[address(this)].withdrawBalance += CUT;
        } else {
            // who won?
            game.player1.reveal = _selection;
            if (game.player1.reveal == game.player2.reveal) {
                // nobody won
                removeGameStake(game);

                // add stakes to winners withdraw balance:
                balances[game.player1.addr].withdrawBalance += CUT;
                balances[game.player2.addr].withdrawBalance += CUT;
                balances[address(this)].withdrawBalance += INITIAL_STAKE;
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

                removeGameStake(game);
                // add stakes to winner withdraw balance:
                balances[winner].withdrawBalance += INITIAL_STAKE + CUT;
                balances[address(this)].withdrawBalance += CUT;
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

    function removeGameStake(Game storage currentGame) internal {
        balances[currentGame.player1.addr].stakedBalance -= INITIAL_STAKE;
        balances[currentGame.player2.addr].stakedBalance -= INITIAL_STAKE;
    }

    function validateSelection(Selection _selection)
        internal
        pure
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
        if (_selection1 == Selection.ROCK && _selection2 == Selection.LIZARD)
            return (true, false);
        if (_selection1 == Selection.ROCK && _selection2 == Selection.SPOCK)
            return (false, true);
        
        if (_selection1 == Selection.PAPER && _selection2 == Selection.ROCK)
            return (true, false);
        if (_selection1 == Selection.PAPER && _selection2 == Selection.SCISSORS)
            return (false, true);
        if (_selection1 == Selection.PAPER && _selection2 == Selection.SPOCK)
            return (true, false);
        if (_selection1 == Selection.PAPER && _selection2 == Selection.LIZARD)
            return (false, true);
        
        if (_selection1 == Selection.SCISSORS && _selection2 == Selection.ROCK)
            return (false, true);
        if (_selection1 == Selection.SCISSORS && _selection2 == Selection.PAPER)
            return (true, false);
        if (_selection1 == Selection.SCISSORS && _selection2 == Selection.SPOCK)
            return (false, true);
        if (_selection1 == Selection.SCISSORS && _selection2 == Selection.LIZARD)
            return (true, false);
        
        if (_selection1 == Selection.LIZARD && _selection2 == Selection.PAPER)
            return (true, false);
        if (_selection1 == Selection.LIZARD && _selection2 == Selection.SPOCK)
            return (true, false);
        if (_selection1 == Selection.LIZARD && _selection2 == Selection.ROCK)
            return (true, false);
        if (_selection1 == Selection.LIZARD && _selection2 == Selection.SCISSORS)
            return (false, true);
     
        if (_selection1 == Selection.SPOCK && _selection2 == Selection.PAPER)
            return (false, true);
        if (_selection1 == Selection.SPOCK && _selection2 == Selection.LIZARD)
            return (false, true);
        if (_selection1 == Selection.SPOCK && _selection2 == Selection.ROCK)
            return (true, false);
        if (_selection1 == Selection.SPOCK && _selection2 == Selection.SCISSORS)
            return (true, false);
     
        
    }

    // user can withdraw to their address
    function withdraw() external {
        sendToken(msg.sender, msg.sender);
    }

    // donate:
    // anyone can call donate - donates money from donation pool
    function donate() external {
        sendToken(address(this), DONATION_ADDRESS);
    }

    function sendToken(address origin, address destination) internal {
        uint256 amount = balances[origin].withdrawBalance;
        if (amount == 0) revert NotEnoughBalance();

        balances[origin].withdrawBalance = 0;

        // contract to msg.sender
        payable(destination).sendValue(amount);
    }

    // check game expiration time and decide on how to evaluateGame
    function unlockStakedValue(uint256 _gameId) public {
        Game storage game = games[_gameId];

        // time has expired and state is still not finished
        if (block.timestamp < game.deadline) revert GameNotExpired();
        if (game.state == State.FINISHED) revert GameHasEnded();

        if (game.state == State.FIRST_COMMIT) {
            // pl1 played but pl2 not, pl1 gets money back
            balances[game.player1.addr].stakedBalance -= INITIAL_STAKE;
            balances[game.player1.addr].withdrawBalance += INITIAL_STAKE;
        } else if (game.state == State.FIRST_REVEAL) {
            // pl2 played but pl1 did not reveal, pl1 loses
            removeGameStake(game);

            // add to winner withdraw balance:
            balances[game.player2.addr].withdrawBalance += INITIAL_STAKE + CUT;
            balances[address(this)].withdrawBalance += CUT;
        }
    }

    function getCommit(Selection _selection, bytes memory _passphrase) external pure returns(bytes32) {
        return keccak256(abi.encodePacked(_selection, _passphrase));
    }

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
