const isEmpty = require("is-empty");

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
    const { body, userID } = req;

    if (!isEmpty(userID)) {
      const fromBag = await model.cryptoBags.findOne({
        where: {
          userID: userID,
          cryptoID: body?.cryptoID,
        },
        raw: true,
      });

      if (!isEmpty(fromBag) && fromBag.amount >= body?.amount) {
        const transaction = await sequelize.transaction();
        try {
          const tempTran = {
            userID: userID,
            cryptoID: body?.cryptoID,
            ownerCryptoBagID: body?.ownerCryptoBagID,
            transactionType: body?.transactionType,
            amount: body?.amount,
            targetCryptoBagID: body?.targetCryptoBagID,
            statusID: 12,
            created_by: userID,
            updated_by: userID,
            updated_at: new Date(),
          };
          const tran = await model.transaction.create(tempTran, {
            transaction,
          });
          const targetBag = await model.cryptoBags.findOne({
            transaction,
            where: {
              cryptoID: body?.cryptoID,
              cryptoBagID: body?.targetCryptoBagID,
            },
            raw: true,
          });
          await model.cryptoBags.update(
            {
              ...fromBag,
              amount: Number(fromBag.amount) - Number(body?.amount),
            },
            {
              where: {
                cryptoBagID: fromBag?.cryptoBagID,
              },
            }
          );

          await model.cryptoBags.update(
            {
              ...targetBag,
              amount: Number(targetBag.amount) + Number(body?.amount),
            },
            {
              where: {
                cryptoBagID: targetBag?.cryptoBagID,
              },
            }
          );
          await transaction.commit();
          return res.status(200).json({ code: "success", data: tran });
        } catch (error) {
          await transaction.rollback();
          res.status(500).json("error");
        }
      }
    }
  } catch (error) {
    res.status(500).json("error");
  }
});

module.exports = router;
