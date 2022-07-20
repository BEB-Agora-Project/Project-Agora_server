const {
  Nftitem,
  Normalitem,
  Normalitemlist,
  User,
  Debate,
} = require("../models");

module.exports = {
  serverInit: async (req, res) => {
    await Nftitem.bulkCreate([
      {
        token_id: 3,
        token_uri: "https://nftjson1123.herokuapp.com/agora/3",
        image_uri: "https://i.postimg.cc/jjqd8xH3/image.jpg",
        price: 500,
      },
      {
        token_id: 4,
        token_uri: "https://nftjson1123.herokuapp.com/agora/4",
        image_uri: "https://i.postimg.cc/QdxRwHz7/img.gif",
        price: 500,
      },
      {
        token_id: 5,
        token_uri: "https://nftjson1123.herokuapp.com/agora/5",
        image_uri:
          "https://i.postimg.cc/mgX0sTx5/png-transparent-pepe-frog-illustration-gif-imgur-tenor-know-your-meme-twitch-emotes-vertebrate-meme.png",
        price: 500,
      },
      {
        token_id: 6,
        token_uri: "https://nftjson1123.herokuapp.com/agora/6",
        image_uri:
          "https://i.postimg.cc/BQNzTJvn/png-transparent-pepe-the-frog-happiness-internet-meme-meme-love-face-leaf.png",
        price: 500,
      },
      {
        token_id: 7,
        token_uri: "https://nftjson1123.herokuapp.com/agora/7",
        image_uri:
          "https://i.postimg.cc/j5V3x5MZ/png-transparent-pepe-the-frog-illustration-pepe-the-frog-kek-4chan-internet-meme-punch-punch-mammal.png",
        price: 500,
      },
      {
        token_id: 8,
        token_uri: "https://nftjson1123.herokuapp.com/agora/8",
        image_uri:
          "https://i.postimg.cc/DfPph7LP/png-transparent-pepe-the-frog-information-internet-video-game-others-miscellaneous-food-leaf.png",
        price: 500,
      },
    ]);

    await Normalitem.bulkCreate([
      { itemname: "bronze Badge", price: 100 },
      { itemname: "silver Badge", price: 200 },
      { itemname: "gold Badge", price: 300 },
    ]);

    await Debate.create({
      title: "연장근무 규제 '주 12시간' → '월 52시간', 유연근로 왜 필요한가",
      content:
        "한국 근로자의 한 주 근로시간은 최대 52시간으로 정해져 있다. 이른바 ‘주 52시간 근로제’로, 근로기준법에 명시된 규정이다. 하루 8시간씩 기본 40시간에 초과근로가 12시간만 인정된다. 이 때문에 기업에 주문 물량이 밀려들어 일손이 모자라도 근로자당 매주 12시간 넘게 초과근로하면 불법이다. 근로자가 자발적으로 일을 더 하고 초과임금을 받고 싶어도 안 된다. 반도체·바이오 등 신산업에서의 집중 연구 역시 이 시간을 준수하는 선에서만 가능하다. 윤석열 정부가 초과근로 ‘주당 12시간’ 규정을 ‘월간 52시간’으로 바꾸겠다고 나선 이유다. 특별한 사정이 있어 한주 60시간(20시간 초과근무) 일하면 그다음 주는 40시간으로 월간 기준만 맞추게 하자는 것이다. 하지만 노동계는 전체 근로시간이 늘어날 우려가 있다며 반대한다. 주 52시간제 유연화, 어떻게 볼 것인가.",
    });

    return res.send("Created");
  },
};
