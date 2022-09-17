import { Container, Heading, Stack, Button, Box, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Link from "next/link";

const Play = () => {
	const [userSelection, setUserSelection] = useState(null);
	const [index, setIndex] = useState(0);
	const [choosing, setChoosing] = useState(true); 
	const options = ["🪨", "📜", "✂️", "🦎", "🖖"];

	const clickHandler = (value) => {
    	setUserSelection(choosing == true ? value : null);
		setChoosing( choosing == true ? false : true); 
  	};

	useEffect(() => {
    	if(choosing == true) {
			const interval = setInterval(() => {
      			setIndex((prevIndex) => {
        		// reset index if current index is greater than array size
        		return prevIndex + 1 < options.length ? prevIndex + 1 : 0;
      			});
    		}, 100);
    		return () => clearInterval(interval);
		}
  	});

	return (
		<Container paddingY="10">
			<Heading mb='10'>Play</Heading>
			<Heading size='md'> Make your choice </Heading>

			<Box p='4' display='flex' justifyItems='center'>
				<Box 
					as='button'
					height='30%'
					width='50%'
					px='20px'
					fontSize='150px'
					fontWeight='semibold'
					onClick={() => clickHandler(options[index])}
					>
						{options[index]}
					</Box>
			</Box>
			<Link href="/reveal"> reveal </Link>
		</Container>
	);
};

export default Play;
