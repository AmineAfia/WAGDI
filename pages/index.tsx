import {
	Button,
	Container,
	Heading,
	ListItem,
	UnorderedList,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import Link from "next/link";
import { StartAndPlay } from "../components/StartAndPlay";
import { useEffect } from "react";

export default function Home() {
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

	return (
		<Container paddingY="10">
			<ConnectButton />
			{/* Feel free to delete this Info section before getting started */}
			<Info />
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
			<StartAndPlay />
		</Container>
	);
};
