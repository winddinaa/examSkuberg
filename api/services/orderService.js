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
}

module.exports = TransactionService;
