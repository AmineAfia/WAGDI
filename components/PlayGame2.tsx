import { Box, Button } from "@chakra-ui/react";
import { ethers } from "ethers";
import * as React from "react";
import {
	useContractRead,
	useContractWrite,
	usePrepareContractWrite,
	useWaitForTransaction,
} from "wagmi";
import abi from "../assets/abi.json";

const contractAddress = "0x84866CCf525128a8290c10031CEf0B4B98EA5C69";

export function PlayGame2() {
	const [userSelection, setUserSelection] = React.useState(null);
	const [index, setIndex] = React.useState(0);
	const [choosing, setChoosing] = React.useState(true);
	const options = ["🪨", "📜", "✂️", "🦎", "🖖"];

	const clickHandler = (value) => {
		setUserSelection(choosing == true ? value : null);
		setChoosing(choosing == true ? false : true);
	};

	React.useEffect(() => {
		if (choosing == true) {
			const interval = setInterval(() => {
				setIndex((prevIndex) => {
					// reset index if current index is greater than array size
					return prevIndex + 1 < options.length ? prevIndex + 1 : 0;
				});
			}, 100);
			return () => clearInterval(interval);
		}
	});

	const { data, isError } = useContractRead({
		addressOrName: contractAddress,
		contractInterface: abi,
		functionName: "getCommit",
		args: [0, "0x1224"],
	});

	const { config } = usePrepareContractWrite({
		addressOrName: contractAddress,
		contractInterface: abi,
		functionName: "createGame",
		args: [data],
		overrides: {
			value: ethers.utils.parseEther("0.001"),
		},
	});

	const { data: writeData, write } = useContractWrite(config);

	const { isLoading, isSuccess } = useWaitForTransaction({
		hash: writeData?.hash,
	});

	return (
		<div>
			<Box p="4" display="flex" justifyItems="center">
				<Box
					as="button"
					height="30%"
					width="50%"
					px="20px"
					fontSize="150px"
					fontWeight="semibold"
					disabled={!write}
					onClick={() => {
						write?.();
						clickHandler(options[index]);
					}}
				>
					{options[index]}
				</Box>
			</Box>

			{/* <Button
				size="md"
				height="48px"
				width="200px"
				border="2px"
				borderColor="green.500"
				disabled={!write}
				onClick={() => write?.()}
			>
				{isLoading ? "LFGing..." : "LFG"}
			</Button> */}

			{isLoading ? "🪄🪄🪄🪄🪄🪄 Afri confirming... 🪄🪄🪄🪄🪄" : ""}

			{isSuccess && (
				<div>
					Successfully created a Game and played a move!
					<div>
						<a
							href={`https://goerli.etherscan.io/tx/${writeData?.hash}`}
						>
							See it in Etherscan
						</a>
					</div>
				</div>
			)}
		</div>
	);
}
