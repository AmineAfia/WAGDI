import { Container, Heading } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PlayGame } from "../components/playGame";
import { PlayGame2 } from "../components/PlayGame2";
export default function Home() {
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
				✂️📜🪨 WAGDI 🪨📜✂️
			</Heading>
			<PlayGame2 />
		</Container>
	);
};
