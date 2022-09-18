import {
	Box,
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	useDisclosure,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import React, { useEffect } from "react";
import abi from "../assets/abi.json";

const contractAddress = "0x84866CCf525128a8290c10031CEf0B4B98EA5C69";

export function ResultModal(props) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const finalRef = React.useRef(null);

	const revealWinner = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);

		const signer = provider.getSigner();
		console.log(signer);
		const wagdiContract = new ethers.Contract(
			contractAddress,
			abi,
			provider
		);

		console.log("lllllllllllllllllllllllll");
		console.log(parseInt(props.gameId));
		console.log(parseInt(props.selection));
		console.log(props.passphrase);
		console.log("lllllllllllllllllllllllll");
		const pendingTxn = await wagdiContract
			.connect(signer)
			.reveal(
				parseInt(props.gameId),
				parseInt(props.selection),
				props.passphrase
			);
		console.log(pendingTxn);

		const filter = {
			address: contractAddress,
			topics: [
				ethers.utils.id(
					"GameResult(uint256,uint256,uint256,address,uint8)"
				),
			],
		};

		const websocketProvider = new ethers.providers.AlchemyWebSocketProvider(
			"goerli",
			"QSiAQ6zbT7ol22NKgKIFh65LO0cFLy5Y"
		);
		websocketProvider.on(filter, async (tt) => {
			const iface = new ethers.utils.Interface(abi);
			const resultEvent = iface.decodeEventLog("GameResult", tt.data);
			// setGameId(newGameId["gameId"]);
			alert(`The winner is: ${resultEvent["winner"]}`);
		});
	};

	// useEffect(() => {
	// 	revealWinner();
	// });

	const triggerReveal = () => {
		// onOpen();
		revealWinner();
	};

	return (
		<>
			<Button mt={4} onClick={triggerReveal}>
				See Result
			</Button>
			{/* <Box
				ref={finalRef}
				tabIndex={-1}
				aria-label="Focus moved to this box"
			>
				Some other content that'll receive focus on close.
			</Box>

			<Button mt={4} onClick={triggerReveal}>
				See Result
			</Button>
			<Modal finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Result</ModalHeader>
					<ModalCloseButton />
					<ModalBody>You just got rugged</ModalBody>

					<ModalFooter>
						<Button colorScheme="blue" mr={3} onClick={onClose}>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal> */}
		</>
	);
}
