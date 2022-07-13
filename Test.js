// const { debateList } = require("./utils/debateList");

// module.exports = {
//   Test: (req, res) => {
//     const { title, content } = req.body;
//     const obj = { title: title, content: content };
//     debateList.push(obj);
//     let newDebate =
//       debateList.length !== 0
//         ? debateList.shift()
//         : {
//             title: title,
//             content: content,
//           };
//     return res.json(newDebate);
//   },
// };

const cron = require("node-cron");

function test() {
  cron.schedule("* * * * * *", () => {
    console.log(1);
  });
}
