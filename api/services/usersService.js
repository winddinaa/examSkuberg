const userService = {
  createUser: async (username, password) => {
    const transaction = await sequelize.transaction();
    try {
      const newUser = await model.users.create(
        {
          username: username,
          password: password,
          created_by: 99999,
          updated_at: new Date(),
          updated_by: 99999,
        },
        { transaction }
      );

      if (!newUser.dataValues.userID) {
        throw new Error("Failed to create user");
      }

      const cryptoList = await model.crypto.findAll({ transaction, raw: true });
      const fiatList = await model.fiat.findAll({ transaction, raw: true });

      await Promise.all(
        cryptoList.map(async (itemCrypto) => {
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
        fiatList.map(async (itemFiat) => {
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
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};

module.exports = userService;
