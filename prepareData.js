const dotenv = require("dotenv");
const { Op } = require("sequelize");
var empty = require("is-empty");
dotenv.config();
const initDb = require("./db");

global.model = {};

// Data
const initUser = [
  {
    username: "user_t01",
    password: "P@ssword",
    created_by: 99999,
    updated_at: new Date(),
    updated_by: 99999,
  },
  {
    username: "user_t02",
    password: "P@ssword",
    created_by: 99999,
    updated_at: new Date(),
    updated_by: 99999,
  },
];

const initFiat = [
  {
    currencyName: "THB",
    price: 1,
    created_by: 99999,
    updated_at: new Date(),
    updated_by: 99999,
  },
  {
    currencyName: "USD",
    price: 30,
    created_by: 99999,
    updated_at: new Date(),
    updated_by: 99999,
  },
];
const initCrypto = [
  {
    currencyName: "BTC",
    price: 1627311.64,
    created_by: 99999,
    updated_at: new Date(),
    updated_by: 99999,
  },
  {
    currencyName: "ETH",
    price: 91051.03,
    created_by: 99999,
    updated_at: new Date(),
    updated_by: 99999,
  },
  {
    currencyName: "XRP",
    price: 21.09,
    created_by: 99999,
    updated_at: new Date(),
    updated_by: 99999,
  },
  {
    currencyName: "DOGE",
    price: 2.94,
    created_by: 99999,
    updated_at: new Date(),
    updated_by: 99999,
  },
];
const initDefaultCryptoBag = {
  amount: 10,
  pendingAmount: 0.0,
  totalAmount: 10.0,
  created_by: 99999,
  updated_at: new Date(),
  updated_by: 99999,
};

const initDefaultFiatBag = {
  amount: 1000000,
  pendingAmount: 0.0,
  totalAmount: 1000000.0,
  created_by: 99999,
  updated_at: new Date(),
  updated_by: 99999,
};

const initStatus = [
  {
    statusName: "pending",
    created_by: 99999,
    updated_at: new Date(),
    updated_by: 99999,
  },
  {
    statusName: "success",
    created_by: 99999,
    updated_at: new Date(),
    updated_by: 99999,
  },
  {
    statusName: "cancel",
    created_by: 99999,
    updated_at: new Date(),
    updated_by: 99999,
  },
];

const initializeServer = async () => {
  await initDb();

  const transaction = await sequelize.transaction();

  try {
    // Clear data

    const destroyUsers = await model.users.destroy({
      where: {
        userID: { [Op.gt]: 0 },
      },
      transaction,
    });

    const destroyFiat = await model.fiat.destroy({
      where: {
        fiatID: { [Op.gt]: 0 },
      },
      transaction,
    });

    const destroyCrypto = await model.crypto.destroy({
      where: {
        cryptoID: { [Op.gt]: 0 },
      },
      transaction,
    });

    const destroyCryptoBags = await model.cryptoBags.destroy({
      where: {
        cryptoID: { [Op.gt]: 0 },
      },
      transaction,
    });

    const destroyFiatBags = await model.fiatBags.destroy({
      where: {
        fiatID: { [Op.gt]: 0 },
      },
      transaction,
    });

    const destroyStatus = await model.status.destroy({
      where: {
        statusID: { [Op.gt]: 0 },
      },
      transaction,
    });

    // Add data to table
    await Promise.all(
      initUser.map(async (itemUser) => {
        await model.users.create(itemUser, { transaction });
      })
    );

    await Promise.all(
      initFiat.map(async (itemFiat) => {
        await model.fiat.create(itemFiat, { transaction });
      })
    );

    await Promise.all(
      initCrypto.map(async (itemCrypto) => {
        await model.crypto.create(itemCrypto, { transaction });
      })
    );

    await Promise.all(
      initStatus.map(async (itemStatus) => {
        await model.status.create(itemStatus, { transaction });
      })
    );

    const crypto = await model.crypto.findAll({ transaction, raw: true });
    const fiat = await model.fiat.findAll({ transaction, raw: true });

    await model.users
      .findAll({ transaction, raw: true })
      .then(async (result) => {
        if (!empty(result)) {
          await Promise.all(
            result.map(async (itemUser) => {
              await Promise.all(
                crypto.map(async (itemCrypto) => {
                  await model.cryptoBags.create(
                    {
                      userID: itemUser.userID,
                      cryptoID: itemCrypto.cryptoID,
                      ...initDefaultCryptoBag,
                    },
                    { transaction }
                  );
                })
              );

              await Promise.all(
                fiat.map(async (itemFiat) => {
                  await model.fiatBags.create(
                    {
                      userID: itemUser.userID,
                      fiatID: itemFiat.fiatID,
                      ...initDefaultFiatBag,
                    },
                    { transaction }
                  );
                })
              );
            })
          );
        }
      });

    // Select data and log

    console.log("destroyUsers===>", destroyUsers);
    console.log("destroyFiat===>", destroyFiat);
    console.log("destroyCrypto===>", destroyCrypto);
    console.log("destroyCryptoBags===>", destroyCryptoBags);
    console.log("destroyFiatBags===>", destroyFiatBags);
    console.log("destroyStatus===>", destroyStatus);

    // console.log("checkFiat===>", checkFiat);
    // console.log("checkFiat===>", checkFiat);
    // console.log("checkCrypto===>", checkCrypto);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error("Error initializing server:", error);
  }
};

(async () => {
  try {
    await initializeServer();
  } catch (error) {
    console.error("Error initializing server:", error);
  }
})();
