const { debateList } = require("./utils/debateList");

module.exports = {
  Test: (req, res) => {
    const { title, content } = req.body;
    const obj = { title: title, content: content };
    debateList.push(obj);
    return res.json(debateList);
  },
};
