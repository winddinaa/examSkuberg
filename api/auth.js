const router = express.Router();
const path = require("path")
  .resolve(__dirname)
  .replace(/\\/g, "/")
  .replace(appRoot, "");

router.get(path + "/auth/test", async (req, res) => {
  try {
    return res.status(200).json("test");
  } catch (error) {}
});

module.exports = router;
