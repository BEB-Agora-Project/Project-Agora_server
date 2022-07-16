const router = require("express").Router();

const { itemList, itemBuy } = require("../controllers/market");

router.get("/", itemList);
router.post("/:id", itemBuy);

module.exports = router;
