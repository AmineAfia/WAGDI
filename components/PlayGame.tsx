import { Button } from "@chakra-ui/react";
import * as React from "react";
import {
	useContractWrite,
	usePrepareContractWrite,
	useWaitForTransaction,
} from "wagmi";
import abi from "../assets/abi.json";

export function PlayGame() {
	const { config } = usePrepareContractWrite({
		addressOrName: "0x6BcAa3a385D24057df172d89227922BF91458B9A",
		contractInterface: abi,
		functionName: "createGame",
		args: [1, "0xaf0326d92b97df1221759476b072abfd8084f9be454565124536"],
	});

	// const { config } = usePrepareContractWrite({
	// 	addressOrName: "0xaf0326d92b97df1221759476b072abfd8084f9be",
	// 	contractInterface: ["function mint()"],
	// 	functionName: "mint",
	// });

	const { data, write } = useContractWrite(config);

	const { isLoading, isSuccess } = useWaitForTransaction({
		hash: data?.hash,
	});

	return (
		<div>
			<Button
				size="md"
				height="48px"
				width="200px"
				border="2px"
				borderColor="green.500"
				disabled={!write || isLoading}
				onClick={() => write()}
			>
				{isLoading ? "LFGing..." : "LFG"}
			</Button>
			{isSuccess && (
				<div>
					Successfully created a game!
					<div>
						<a href={`https://etherscan.io/tx/${data?.hash}`}>
							Etherscan
						</a>
					</div>
				</div>
			)}
		</div>
	);
}
