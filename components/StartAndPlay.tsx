import { Box, Button } from "@chakra-ui/react";
import { ethers } from "ethers";
import * as React from "react";
import { useContractRead } from "wagmi";
import abi from "../assets/abi.json";
import { ResultModal } from "./ResultModal";
import { Dragon } from "0xdragon";
const contractAddress = "0x84866CCf525128a8290c10031CEf0B4B98EA5C69";

export function StartAndPlay() {
	const [userSelection, setUserSelection] = React.useState(null);
	const [index, setIndex] = React.useState(0);
	const [choosing, setChoosing] = React.useState(true);
	const [isLoading, setLoading] = React.useState(false);
	const [isSuccess, setSuccess] = React.useState(undefined);
	const [gameId, setGameId] = React.useState(undefined);
	const [gameClosed, setGameClosed] = React.useState(undefined);
	const options = ["🪨", "📜", "✂️", "🦎", "🖖"];
	//TODO: generate random passphrase
	const passPhrase = "0x1224";
	const clickHandler = (value) => {
		setUserSelection(choosing == true ? value : null);
		setChoosing(choosing == true ? false : true);
	};

	React.useEffect(() => {
		if (choosing == true) {
			const interval = setInterval(() => {
				setIndex((prevIndex) => {
					// reset index if current index is greater than array size
					return prevIndex + 1 < options.length ? prevIndex + 1 : 0;
				});
			}, 100);
			return () => clearInterval(interval);
		}
	});

	const writeTxs = async () => {
		setLoading(true);
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);

		const signer = provider.getSigner();
		console.log(signer);
		const wagdiContract = new ethers.Contract(
			contractAddress,
			abi,
			provider
		);
		const dragon = new Dragon("polygonToTheMoon", "myABI");

		const commitment = await wagdiContract.getCommit(index, passPhrase);
		const websocketProvider = new ethers.providers.AlchemyWebSocketProvider(
			"goerli",
			"QSiAQ6zbT7ol22NKgKIFh65LO0cFLy5Y"
		);

		try {
			const pendingTxn = await wagdiContract
				.connect(signer)
				.createGame(commitment, {
					value: ethers.utils.parseEther("0.009"),
				});
			console.log(pendingTxn);

			const filter = {
				address: contractAddress,
				topics: [
					// the name of the event, parnetheses containing the data type of each event, no spaces
					ethers.utils.id(
						"GameCreated(uint256,uint256,uint256,address,uint8)"
					),
				],
			};

			setSuccess(pendingTxn.hash);

			websocketProvider.on(filter, async (tt) => {
				const iface = new ethers.utils.Interface(abi);
				const newGameId = iface.decodeEventLog("GameCreated", tt.data);
				setGameId(newGameId["gameId"]);
			});
		} catch (e) {
			dragon.error(e.error, e.transaction);
			dragon.wallet(e.transaction.from, e.transaction.value._hex);
			throw e;
		}

		const JoinGamefilter = {
			address: contractAddress,
			topics: [
				// the name of the event, parnetheses containing the data type of each event, no spaces
				ethers.utils.id(
					"GameJoined(uint256,uint256,uint256,address,uint8)"
				),
			],
		};

		websocketProvider.on(JoinGamefilter, async (tt) => {
			const iface = new ethers.utils.Interface(abi);
			const newGameId = iface.decodeEventLog("GameJoined", tt.data);
			setGameClosed(true);
		});
	};

	return (
		<div>
			<Box p="4" display="flex" justifyItems="center">
				<Box
					as="button"
					height="30%"
					width="50%"
					px="20px"
					fontSize="150px"
					fontWeight="semibold"
					onClick={() => {
						writeTxs();
						clickHandler(options[index]);
					}}
				>
					{options[index]}
				</Box>
			</Box>
			{isLoading ? "🪄🪄🪄🪄🪄🪄 Afri confirming... 🪄🪄🪄🪄🪄" : ""}
			{isSuccess && (
				<div>
					Successfully created a Game and played a move!
					<div>
						<a href={`https://goerli.etherscan.io/tx/${isSuccess}`}>
							See it in Etherscan
						</a>
					</div>
				</div>
			)}

			{gameId && `Share this code with you opponent: ${gameId}`}
			{gameClosed && (
				<ResultModal
					gameId={gameId}
					selection={index}
					passphrase={passPhrase}
				/>
			)}
		</div>
	);
}
