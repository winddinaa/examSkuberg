const authService = require("./services/authService");
const router = express.Router();
const path = require("path")
  .resolve(__dirname)
  .replace(/\\/g, "/")
  .replace(appRoot, "");

router.post(path + "/auth/login", async (req, res) => {
  try {
    const { username, password } = req?.body;
    const result = await authService.loginUser(username, password);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ code: "error", message: error.message });
  }
});

module.exports = router;
