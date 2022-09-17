import {
	Button,
	Container,
	Heading,
	ListItem,
	UnorderedList,
	IconButton, 
	Flex,
	Spacer
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PlayGame2 } from "../components/PlayGame2";
import { useColorMode } from '@chakra-ui/color-mode';
import {
  MoonIcon,
  SunIcon
} from '@chakra-ui/icons'; 

export default function Home() {
	const { colorMode, toggleColorMode } = useColorMode()
	return (
		<Container paddingY="10">
			<Flex align='items-center'>
				<ConnectButton />
				<Spacer />
				<IconButton aria-label="Toggle Mode" onClick={toggleColorMode}>
          			{ colorMode === 'light' ? <MoonIcon/> : <SunIcon/> }
        		</IconButton>
			</Flex>
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
