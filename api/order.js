const { throws } = require("assert");
const { error } = require("console");
const isEmpty = require("is-empty");

const router = express.Router();
const path = require("path")
  .resolve(__dirname)
  .replace(/\\/g, "/")
  .replace(appRoot, "");

router.post(path + "/order", authenticateToken, async (req, res) => {
  try {
    const { body, userID } = req;
    if (
      !isEmpty(userID) &&
      ["buy", "sell"].includes(body.transactionType) &&
      !isEmpty(body?.amount) &&
      !isEmpty(body?.ownerCryptoBagID) &&
      !isEmpty(body?.cryptoID) &&
      !isEmpty(body?.fiatID) &&
      !isEmpty(body?.targetOrder) &&
      !isEmpty(body?.ownerFiatBagID)
    ) {
      const tempTran = {
        userID: userID,
        ownerCryptoBagID: body?.ownerCryptoBagID,
        ownerFiatBagID: body?.ownerFiatBagID,
        cryptoID: body?.cryptoID,
        fiatID: body?.fiatID,
        amount: body?.amount,
        targetOrder: body?.targetOrder,
        transactionType: body?.transactionType,
        created_by: userID,
        statusID: 11,
      };
      const transaction = await sequelize.transaction();
      try {
        if (
          !isEmpty(body?.transactionType) &&
          body.transactionType === "sell"
        ) {
          const fromCryptoBag = await model.cryptoBags.findOne({
            where: {
              userID: userID,
              cryptoID: body?.cryptoID,
              cryptoBagID: body?.ownerCryptoBagID,
            },
            raw: true,
          });

          if (!isEmpty(fromCryptoBag) && fromCryptoBag.amount >= body?.amount) {
            await model.cryptoBags.update(
              {
                ...fromCryptoBag,
                amount: Number(fromCryptoBag.amount) - Number(body?.amount),
                pendingAmount: Number(body?.amount),
              },
              {
                where: {
                  cryptoBagID: fromCryptoBag?.cryptoBagID,
                },
              }
            );

            const tran = await model.transaction.create(tempTran, {
              transaction,
            });
            await transaction.commit();
            return res.status(200).json({ code: "success", data: tran });
          } else {
            throw new Error("Insufficient balance in your wallet.");
          }
        } else if (
          !isEmpty(body?.transactionType) &&
          body.transactionType === "buy"
        ) {
          const fromFiatBag = await model.fiatBags.findOne({
            where: {
              userID: userID,
              fiatID: body?.fiatID,
              fiatBagID: body?.ownerFiatBagID,
            },
            raw: true,
          });
          if (!isEmpty(fromFiatBag) && fromFiatBag.amount >= body?.amount) {
            await model.fiatBags.update(
              {
                ...fromFiatBag,
                amount: Number(fromFiatBag.amount) - Number(body?.amount),
                pendingAmount:
                  Number(fromFiatBag.fromFiatBag) + Number(body?.amount),
              },
              {
                where: {
                  fiatBagID: fromFiatBag?.fiatBagID,
                },
              }
            );

            const tran = await model.transaction.create(tempTran, {
              transaction,
            });
            await transaction.commit();
            return res.status(200).json({ code: "success", data: tran });
          } else {
            throw new Error("Insufficient balance in your wallet.");
          }
        }
      } catch (error) {
        await transaction.rollback();
        throw new Error(error);
      }
    } else {
      throw new Error("Something wrong");
    }
  } catch (error) {
    return res.status(500).json("error");
  }
});

router.post(path + "/order/transfer", authenticateToken, async (req, res) => {
  try {
    const { body, userID } = req;

    if (!isEmpty(userID)) {
      const fromBag = await model.cryptoBags.findOne({
        where: {
          userID: userID,
          cryptoID: body?.cryptoID,
          cryptoBagID: body?.ownerCryptoBagID,
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

router.post(path + "/orderConfirm", authenticateToken, async (req, res) => {});

module.exports = router;
