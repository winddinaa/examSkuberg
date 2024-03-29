const isEmpty = require("is-empty");

const router = express.Router();
const path = require("path")
  .resolve(__dirname)
  .replace(/\\/g, "/")
  .replace(appRoot, "");
const TransactionService = require("../services/orderService");
const transactionService = new TransactionService();

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

      try {
        let tran;
        if (
          !isEmpty(body?.transactionType) &&
          body.transactionType === "sell"
        ) {
          tran = await transactionService.sellTransaction(
            userID,
            body,
            tempTran
          );
        } else if (
          !isEmpty(body?.transactionType) &&
          body.transactionType === "buy"
        ) {
          tran = await transactionService.buyTransaction(
            userID,
            body,
            tempTran
          );
        }
        return res.status(200).json({ code: "success", data: tran });
      } catch (error) {
        throw error;
      }
    } else {
      throw new Error("Something wrong");
    }
  } catch (error) {
    return res.status(500).json(error.message);
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
        try {
          const tran = transactionService.transferTransaction(
            userID,
            body,
            fromBag
          );
          return res.status(200).json({ code: "success", data: tran });
        } catch (error) {
          throw error;
        }
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
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
          try {
            const resultConfirm =
              await transactionService.confirmSellTransaction(
                userID,
                body,
                interestTransaction,
                reqFiatBag
              );
            return res.status(200).json(resultConfirm);
          } catch (error) {
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

        if (
          !isEmpty(reqCryptoBag) &&
          Number(reqCryptoBag.amount) >= Number(interestTransaction.amount)
        ) {
          try {
            const resultConfirm =
              await transactionService.confirmBuyTransaction(
                userID,
                body,
                interestTransaction,
                reqCryptoBag
              );
            return res.status(200).json(resultConfirm);
          } catch (error) {
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
    return res.status(500).json(error.message);
  }
});

module.exports = router;
