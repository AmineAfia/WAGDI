import { Container, Heading } from "@chakra-ui/react";
import Link from "next/link";

const Waitingroom = () => {
	return (
		<Container paddingY="10">
			<Heading>Waiting Room</Heading>
			<Link href="/play"> play </Link>
		</Container>
	);
};

export default Waitingroom;
