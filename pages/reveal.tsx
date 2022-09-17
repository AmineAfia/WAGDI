import { Container, Image, Heading } from "@chakra-ui/react";
import Link from "next/link";

const Reveal = () => {
	return (
		<Container paddingY="10">
			<Heading>Reveal Page</Heading>
			<Image
				borderRadius="full"
				boxSize="150px"
				src="https://bit.ly/dan-abramov"
				alt="Dan Abramov"
			/>
			<Link href="/result"> result </Link>
		</Container>
	);
};

export default Reveal;
