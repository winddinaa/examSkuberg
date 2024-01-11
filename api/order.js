const router = express.Router();
const path = require("path")
  .resolve(__dirname)
  .replace(/\\/g, "/")
  .replace(appRoot, "");

router.post(path + "/order", async (req, res) => {
  try {
    return res.status(200).json("test");
  } catch (error) {}
});

router.post(path + "/order/transfer", authenticateToken, async (req, res) => {
  try {
    const { body } = req;
    return res.status(200).json("test");
  } catch (error) {}
});

module.exports = router;
