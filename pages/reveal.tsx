import { Container, Heading } from "@chakra-ui/react";
import Link from "next/link";

const Reveal = () => {
	return (
		<Container paddingY="10">
			<Heading>Reveal Page</Heading>
			<Link href="/result"> result </Link>
		</Container>
	);
};

export default Reveal;
