const isEmpty = require("is-empty");

const router = express.Router();
const path = require("path")
  .resolve(__dirname)
  .replace(/\\/g, "/")
  .replace(appRoot, "");
const { jwtToken } = require("../utils/auth");

router.post(path + "/auth/login", async (req, res) => {
  try {
    const { username, password } = req?.body;
    const user = await model.users.findOne({
      raw: true,
      where: { username: username },
    });

    if (
      !isEmpty(user) &&
      user.username == username &&
      user.password == password
    ) {
      const bodyEncrypt = {
        userID: user.userID,
      };
      const token = jwtToken(bodyEncrypt);
      return res.status(200).json({ token: token });
    } else {
      return res
        .status(400)
        .json({ code: "error", message: "invalid username or password" });
    }
  } catch (error) {
    return res.status(500).json("Something wrong");
  }
});

module.exports = router;
