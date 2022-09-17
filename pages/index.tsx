import {
	Button,
	Container,
	Heading,
	ListItem,
	UnorderedList,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

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
				✂️📜🪨WAGDI 🪨📜✂️
			</Heading>

			<Button
				size="md"
				height="48px"
				width="200px"
				border="2px"
				borderColor="green.500"
			>
				<Heading>
					<Link href="/play"> Play </Link>
				</Heading>
			</Button>
		</Container>
	);
};
