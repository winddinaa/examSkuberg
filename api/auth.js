const router = express.Router();
const path = require("path")
  .resolve(__dirname)
  .replace(/\\/g, "/")
  .replace(appRoot, "");

console.log("test======", path + "/auth/test");
router.get(path + "/auth/test", async (req, res) => {
  try {
    return res.status(200).json("test");
  } catch (error) {}
});

module.exports = router;
