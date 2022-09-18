# WAGDI

We All Gonna Donate It - a fun game to nurture donations to public goods through crypto. Play: "🪨Rock 📜Paper ✂️Scissor 🦎Lizard 🖖Spock" with your frens and donate the wins.

Every time you play, you fund public goods. 

Say John 🕺 and Alice 💃 want to play, both use a web3 browser to join:

1 Alice starts the game by using this https://wagdi.vercel.app, stakes an amount to the pot and shares the gameID with John.

2. John joins the game using https://wagdi.vercel.app/join, stakes the same amount to the pot and inputs the gameID

3. Alice has to reveal the results (we explain why later)

4. If John wins, we donate a quarter of the pot to public goods, and vice-versa for Alice. When it´s a draw, we donate half the pot to public goods. 👼👼

We are playing games, having fun and every single time donating to public goods, hurray 🎉


# Technical Explanation 
Now why does Alice have to reveal the result?
The problem with playing a rock-paper-scissors-lizard-spock game on the blockchain is played are playing asynchonisly, which means, Alice might play before John and John might check her move onchain then beat her. For this reasong, we implemented the following solution:

The algorithm uses two stages, we have the `commitment` and the `reveal` stage:
Alice is the player that starts the game and has to commit to her answer, this means her answer is encrypted and sent to the smart contract, at this stage John cannot know her answer, since it's encrypted, and Alice cannot change her answer hence the commitment.

The next step involves John then sending his answer, which is John's commitment.
Alice would then need to reveal her answer, decrypting her commitment and the smart contract can then compare both answers and evaluate the winner.

Hurray! Win, lose or draw, we donate to public goods :)


# Devs stuff not so important 🤓
Run the frontend localy
```
yarn install

yarn dev
```

Contract:
https://goerli.etherscan.io/address/0x84866ccf525128a8290c10031cef0b4b98ea5c69 
