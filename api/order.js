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

          if (
            !isEmpty(fromCryptoBag) &&
            Number(fromCryptoBag.amount) >= Number(body?.amount)
          ) {
            await model.cryptoBags.update(
              {
                ...fromCryptoBag,
                amount: Number(fromCryptoBag.amount) - Number(body?.amount),
                pendingAmount:
                  Number(fromCryptoBag.pendingAmount) + Number(body?.amount),
              },
              {
                transaction,
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
          if (
            !isEmpty(fromFiatBag) &&
            Number(fromFiatBag.amount) >= Number(body?.amount)
          ) {
            await model.fiatBags.update(
              {
                ...fromFiatBag,
                amount: Number(fromFiatBag.amount) - Number(body?.targetOrder),
                pendingAmount:
                  Number(fromFiatBag.pendingAmount) + Number(body?.targetOrder),
              },
              {
                transaction,
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
    return res.status(500).json(error);
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

      if (!isEmpty(fromBag) && Number(fromBag.amount) >= Number(body?.amount)) {
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
              transaction,
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
              transaction,
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

router.post(path + "/order/Confirm", authenticateToken, async (req, res) => {
  const { body, userID } = req;
  try {
    if (!isEmpty(body?.transactionID && !isEmpty(userID))) {
      const interestTransaction = await model.transaction.findOne({
        where: {
          transactionID: body?.transactionID,
        },
        raw: true,
      });
      console.log("interestTransaction===>", interestTransaction);
      if (
        !isEmpty(interestTransaction) &&
        interestTransaction.transactionType === "sell" &&
        interestTransaction.statusID === 11 &&
        interestTransaction.userID != userID
      ) {
        const reqFiatBag = await model.fiatBags.findOne({
          where: {
            userID: userID,
            fiatID: interestTransaction?.fiatID,
          },
          raw: true,
        });

        if (
          !isEmpty(reqFiatBag) &&
          Number(reqFiatBag.amount) >= Number(interestTransaction.targetOrder)
        ) {
          const transaction = await sequelize.transaction();
          const reqCryptoBag = await model.cryptoBags.findOne({
            where: {
              userID: userID,
              cryptoID: interestTransaction?.cryptoID,
            },
            raw: true,
          });
          const ownerTransactionCryptoBag = await model.cryptoBags.findOne({
            where: {
              userID: interestTransaction?.userID,
              cryptoID: interestTransaction?.cryptoID,
            },
            raw: true,
          });
          const ownerTransactionFiatBag = await model.fiatBags.findOne({
            where: {
              userID: interestTransaction?.userID,
              fiatID: interestTransaction?.fiatID,
            },
            raw: true,
          });
          try {
            //update ยอด กระเป๋าเงินคนซือ
            await model.fiatBags.update(
              {
                ...reqFiatBag,
                amount:
                  Number(reqFiatBag.amount) -
                  Number(interestTransaction.targetOrder),
              },
              {
                transaction,
                where: {
                  fiatBagID: reqFiatBag?.fiatBagID,
                },
              }
            );
            //update ยอด กระเป๋าเงินคนขาย
            await model.fiatBags.update(
              {
                ...ownerTransactionFiatBag,
                amount:
                  Number(reqFiatBag.amount) +
                  Number(interestTransaction.targetOrder),
              },
              {
                transaction,
                where: {
                  fiatBagID: ownerTransactionFiatBag?.fiatBagID,
                },
              }
            );
            //update ยอด กระเป๋าคริปโตคนขาย
            await model.cryptoBags.update(
              {
                ...ownerTransactionCryptoBag,
                pendingAmount:
                  Number(ownerTransactionCryptoBag.pendingAmount) -
                  Number(interestTransaction.amount),
              },
              {
                transaction,
                where: {
                  cryptoBagID: ownerTransactionCryptoBag?.cryptoBagID,
                },
              }
            );
            //update ยอด กระเป๋าคริปโตคนซื้อ
            await model.cryptoBags.update(
              {
                ...reqCryptoBag,
                amount:
                  Number(reqCryptoBag.amount) +
                  Number(interestTransaction.amount),
              },
              {
                transaction,
                where: {
                  cryptoBagID: reqCryptoBag?.cryptoBagID,
                },
              }
            );
            //created transaction โอนคริปโต
            await model.transaction.create(
              {
                userID: userID,
                cryptoID: interestTransaction?.cryptoID,
                ownerCryptoBagID: reqCryptoBag.cryptoBagID,
                transactionType: "transferOrder",
                amount: interestTransaction?.amount,
                targetCryptoBagID: interestTransaction?.userID,
                statusID: 12,
                created_by: userID,
                updated_by: userID,
                updated_at: new Date(),
                refTransaction: interestTransaction?.transactionID,
              },
              {
                transaction,
              }
            );
            await model.transaction.update(
              {
                ...transaction,
                statusID: 12,
              },
              {
                transaction,
                where: {
                  transactionID: body?.transactionID,
                },
              }
            );
            await transaction.commit();
            return res.status(200).json({ code: "success" });
          } catch (error) {
            await transaction.rollback();
            throw new Error(error);
          }
        } else {
          throw new Error("Something wrong");
        }
      } else if (
        !isEmpty(interestTransaction) &&
        interestTransaction.transactionType === "buy" &&
        interestTransaction.statusID === 11 &&
        interestTransaction.userID != userID
      ) {
        const reqCryptoBag = await model.cryptoBags.findOne({
          where: {
            userID: userID,
            cryptoID: interestTransaction?.cryptoID,
          },
          raw: true,
        });
        console.log("reqCryptoBag=>", reqCryptoBag);
        console.log(
          "===>",
          Number(reqCryptoBag.amount) >= Number(interestTransaction.amount)
        );
        if (
          !isEmpty(reqCryptoBag) &&
          Number(reqCryptoBag.amount) >= Number(interestTransaction.amount)
        ) {
          const transaction = await sequelize.transaction();
          const reqFiatBag = await model.fiatBags.findOne({
            where: {
              userID: userID,
              fiatID: interestTransaction?.fiatID,
            },
            raw: true,
          });
          const ownerTransactionCryptoBag = await model.cryptoBags.findOne({
            where: {
              userID: interestTransaction?.userID,
              cryptoID: interestTransaction?.cryptoID,
            },
            raw: true,
          });
          const ownerTransactionFiatBag = await model.fiatBags.findOne({
            where: {
              userID: interestTransaction?.userID,
              fiatID: interestTransaction?.fiatID,
            },
            raw: true,
          });
          try {
            //update ยอด กระเป๋าเงินคนขาย
            await model.fiatBags.update(
              {
                ...reqFiatBag,
                amount:
                  Number(reqFiatBag.amount) +
                  Number(interestTransaction.targetOrder),
              },
              {
                transaction,
                where: {
                  fiatBagID: reqFiatBag?.fiatBagID,
                },
              }
            );
            //update ยอด กระเป๋าเงินคนขาย
            await model.fiatBags.update(
              {
                ...ownerTransactionFiatBag,
                pendingAmount:
                  Number(ownerTransactionFiatBag.pendingAmount) -
                  Number(interestTransaction.targetOrder),
              },
              {
                transaction,
                where: {
                  fiatBagID: ownerTransactionFiatBag?.fiatBagID,
                },
              }
            );
            //update ยอด กระเป๋าคริปโตคนซื้อ
            await model.cryptoBags.update(
              {
                ...ownerTransactionCryptoBag,
                amount:
                  Number(ownerTransactionCryptoBag.amount) +
                  Number(interestTransaction.amount),
              },
              {
                transaction,
                where: {
                  cryptoBagID: ownerTransactionCryptoBag?.cryptoBagID,
                },
              }
            );
            //update ยอด กระเป๋าคริปโตคนขาย
            await model.cryptoBags.update(
              {
                ...reqCryptoBag,
                amount:
                  Number(reqCryptoBag.amount) -
                  Number(interestTransaction.amount),
              },
              {
                transaction,
                where: {
                  cryptoBagID: reqCryptoBag?.cryptoBagID,
                },
              }
            );

            //created transaction โอนคริปโต
            await model.transaction.create(
              {
                userID: userID,
                cryptoID: interestTransaction?.cryptoID,
                ownerCryptoBagID: interestTransaction.ownerCryptoBagID,
                transactionType: "transferOrder",
                amount: interestTransaction?.amount,
                targetCryptoBagID: reqCryptoBag?.cryptoBagID,
                statusID: 12,
                created_by: userID,
                updated_by: userID,
                updated_at: new Date(),
                refTransaction: interestTransaction?.transactionID,
              },
              {
                transaction,
              }
            );
            await model.transaction.update(
              {
                ...transaction,
                statusID: 12,
              },
              {
                transaction,
                where: {
                  transactionID: body?.transactionID,
                },
              }
            );
            await transaction.commit();
            return res.status(200).json({ code: "success" });
          } catch (error) {
            await transaction.rollback();
            throw new Error(error);
          }
        } else {
          throw new Error("Insufficient balance in your wallet.");
        }
      } else {
        throw new Error("Transaction not found.");
      }
    } else {
      throw new Error("Insufficient balance in your wallet.");
    }
  } catch (error) {
    console.log("error=>", error);
    return res.status(500).json("error");
  }
});

module.exports = router;
