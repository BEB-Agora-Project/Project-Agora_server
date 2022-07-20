const router = require("express").Router();

const {
  getNFTItemList,
  buyNFTItem,
  getNormalItemList,
  buyNormalItem,
} = require("../controllers/market");

// router.get("/", itemList)

router.get("/nft", getNFTItemList);
router.get("/normalitem", getNormalItemList);
router.post("/nft", buyNFTItem);
router.post("/normalitem", buyNormalItem);

router;

module.exports = router;
