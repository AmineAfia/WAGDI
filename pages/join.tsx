import {
	Box,
	Button,
	Container,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	Input,
	ListItem,
	UnorderedList,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import Link from "next/link";
import { JoinAndPlay } from "../components/JoinAndPlay";
import { useEffect, useState } from "react";

export default function Join() {
	const [gameId, setGameId] = useState("0");
	const [playGame, setPlayGame] = useState(undefined);

	useEffect(() => {
		// const tt = provider.getBlockNumber();
		// tt.then((foo) => {
		// 	console.log(foo);
		// });
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		provider.send("eth_requestAccounts", []).then(() => {
			const signer = provider.getSigner();
			console.log(signer);
		});
	});

	const setJoinCode = (v) => {
		setPlayGame(true);
		console.log(v);
	};

	const renderCodeScreen = () => {
		return (
			<Flex width="full" align="center" justifyContent="center">
				<Box p={2}>
					<Box textAlign="center">
						<Heading>WAGDI</Heading>
					</Box>
					<Box my={4} textAlign="left">
						<form onSubmit={setJoinCode}>
							<FormControl>
								<FormLabel>Game ID</FormLabel>
								<Input
									type="number"
									placeholder="69"
									onChange={(event) =>
										setGameId(event.currentTarget.value)
									}
								/>
							</FormControl>
							<Button width="full" mt={4} onClick={setJoinCode}>
								🚀 LOOOOOOOS 🚀
							</Button>
						</form>
					</Box>
				</Box>
			</Flex>
		);
	};

	const renderPlayScreen = () => {
		return (
			<div>
				<ConnectButton />
				{gameId}
				<Info />
			</div>
		);
	};

	return (
		<Container paddingY="10">
			{playGame ? renderPlayScreen() : renderCodeScreen()}
		</Container>
	);
}

// Feel free to delete this before getting started
const Info = () => {
	return (
		<Container>
			<Heading mt="10" mb="10">
				✂️📜🪨WAGDI 🪨📜✂️
			</Heading>
			<JoinAndPlay />
		</Container>
	);
};
