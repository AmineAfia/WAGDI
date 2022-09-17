import { Container, Heading } from "@chakra-ui/react";
import Link from "next/link";

const Play = () => {
	return (
		<Container paddingY="10">
			<Heading>Play</Heading>
			<Link href="/reveal"> reveal </Link>
		</Container>
	);
};

export default Play;
