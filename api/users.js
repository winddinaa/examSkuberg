const router = express.Router();
const path = require("path")
  .resolve(__dirname)
  .replace(/\\/g, "/")
  .replace(appRoot, "");
const isEmpty = require("is-empty");
const userService = require("./services/usersService");

var passwordValidator = require("password-validator");
var schema = new passwordValidator();
schema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(100) // Maximum length 100
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(2) // Must have at least 2 digits
  .has()
  .not()
  .spaces() // Should not have spaces
  .is()
  .not();
router.post(path + "/users/mock", async (req, res) => {
  try {
    const { body } = req;
    if (!isEmpty(body?.username) && !isEmpty(body.password)) {
      const validatePass = schema.validate(body.password);
      if (validatePass) {
        const allUsers = await model.users.findAll({ raw: true });
        const isAlready = allUsers
          .map((itemUsers) => itemUsers.username)
          .includes(body?.username);

        if (isAlready) {
          return res.status(400).json("username already use");
        } else {
          const result = await userService.createUser(
            body.username,
            body.password
          );
          if (result.success) {
            return res.status(200).json({ code: "success" });
          } else {
            return res
              .status(500)
              .json({ code: "error", message: "Failed to create user" });
          }
        }
      } else {
        const error = new Error("Password not secure");
        error.statusCode = 400;
        throw error;
      }
    } else {
      const error = new Error("Please fill username and password");
      error.statusCode = 400;
      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      code: "error",
      message: error?.message || "Internal server error",
      status: error?.statusCode || 500,
    });
  }
});

module.exports = router;

module.exports = router;
