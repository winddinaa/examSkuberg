const isEmpty = require("is-empty");

class TransactionService {
  async sellTransaction(userID, body, tempTran) {
    // โค้ดที่ใช้ในการขาย
    const transaction = await sequelize.transaction();
    try {
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
        return tran;
      } else {
        throw new Error("Insufficient balance in your wallet.");
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async buyTransaction(userID, body, tempTran) {
    // โค้ดที่ใช้ในการซื้อ
    const transaction = await sequelize.transaction();
    try {
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
        return tran;
      } else {
        throw new Error("Insufficient balance in your wallet.");
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async confirmSellTransaction(userID, body, interestTransaction, reqFiatBag) {
    const transaction = await sequelize.transaction();
    try {
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

      //update ยอด กระเป๋าเงินคนซือ
      await model.fiatBags.update(
        {
          ...reqFiatBag,
          amount:
            Number(reqFiatBag.amount) - Number(interestTransaction.targetOrder),
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
            Number(reqFiatBag.amount) + Number(interestTransaction.targetOrder),
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
            Number(reqCryptoBag.amount) + Number(interestTransaction.amount),
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
      return { code: "success" };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async confirmBuyTransaction(userID, body, interestTransaction, reqCryptoBag) {
    const transaction = await sequelize.transaction();
    try {
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
              Number(reqCryptoBag.amount) - Number(interestTransaction.amount),
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
        return { code: "success" };
      } catch (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      await transaction.rollback();
    }
  }
  async transferTransaction(userID, body, fromBag) {
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
      return tran;
    } catch (error) {
      await transaction.rollback();
    }
  }
}

module.exports = TransactionService;
