import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';
import { ChakraProvider } from '@chakra-ui/react';
import { alchemyProvider } from "wagmi/providers/alchemy";

const { chains, provider } = configureChains(
	[chain.goerli], // you can add more chains here like chain.mainnet, chain.optimism etc.
	[alchemyProvider({ alchemyId: "QSiAQ6zbT7ol22NKgKIFh65LO0cFLy5Y" })]
);

const { connectors } = getDefaultWallets({
	appName: "Next.js Chakra Rainbowkit Wagmi Starter",
	chains,
});

const wagmiClient = createClient({
	autoConnect: false,
	connectors,
	provider,
});

function MyApp({ Component, pageProps }) {
	return (
		<ChakraProvider>
			<WagmiConfig client={wagmiClient}>
				<RainbowKitProvider chains={chains}>
					<Component {...pageProps} />
				</RainbowKitProvider>
			</WagmiConfig>
		</ChakraProvider>
	);
}

export default MyApp;

