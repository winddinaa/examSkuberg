const router = express.Router();
const isEmpty = require("is-empty");
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
  .not()
  .oneOf(["Passw0rd", "Password123"]); // Blacklist these values

const path = require("path")
  .resolve(__dirname)
  .replace(/\\/g, "/")
  .replace(appRoot, "");

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
          res.status(400).json("username already use");
        } else {
          const transaction = await sequelize.transaction();
          try {
            const newUser = await model.users.create(
              {
                username: body.username,
                password: body.password,
                created_by: 99999,
                updated_at: new Date(),
                updated_by: 99999,
              },
              { transaction }
            );
            if (!isEmpty(newUser.dataValues.userID)) {
              const crypto = await model.crypto.findAll({
                transaction,
                raw: true,
              });
              const fiat = await model.fiat.findAll({ transaction, raw: true });

              await Promise.all(
                crypto.map(async (itemCrypto) => {
                  await model.cryptoBags.create(
                    {
                      userID: newUser.dataValues.userID,
                      cryptoID: itemCrypto.cryptoID,
                      amount: 10,
                      pendingAmount: 0.0,
                      totalAmount: 10.0,
                      created_by: 99999,
                      updated_at: new Date(),
                      updated_by: 99999,
                    },
                    { transaction }
                  );
                })
              );

              await Promise.all(
                fiat.map(async (itemFiat) => {
                  await model.fiatBags.create(
                    {
                      userID: newUser.dataValues.userID,
                      fiatID: itemFiat.fiatID,
                      amount: 1000000,
                      pendingAmount: 0.0,
                      totalAmount: 1000000.0,
                      created_by: 99999,
                      updated_at: new Date(),
                      updated_by: 99999,
                    },
                    { transaction }
                  );
                })
              );
              await transaction.commit();
              return res.status(200).json({ code: "success" });
            }
          } catch (error) {
            await transaction.rollback();
          }
        }
      }
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
