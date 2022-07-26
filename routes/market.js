const router = require("express").Router();

const {
  getNFTItemList,
  buyNFTItem,
  getNormalItemList,
  buyNormalItem,
} = require("../controllers/market");
const {isAuthorized} = require("../middleware/webToken");

// router.get("/", itemList)

router.get("/nft", isAuthorized,getNFTItemList);
router.get("/normalitem",isAuthorized, getNormalItemList);
router.post("/nft", isAuthorized,buyNFTItem);
router.post("/normalitem",isAuthorized, buyNormalItem);
module.exports = router;
