import { Container, Heading } from "@chakra-ui/react";
import Link from "next/link";

const Result = () => {
	return (
		<Container paddingY="10">
			<Heading>Reveal Page</Heading>
			<h1> 🎉🎉🎉🎉🎉</h1>
			<Link href="/"> play again </Link>
		</Container>
	);
};

export default Result;
