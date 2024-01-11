const { Sequelize, DataTypes } = require("sequelize");
const env = require("dotenv").config().parsed;
const { globSync } = require("glob");

const initDb = async () => {
  try {
    //config connect Database
    global.sequelize = new Sequelize(
      env.DB_NAME,
      env.DB_USERNAME,
      env.DB_PASS,
      {
        host: env.DB_HOST,
        dialect: env.DB_DIALECT,
        dialectOptions: { requestTimeout: 300000 },
      }
    );

    // test connection Database
    await sequelize.authenticate();

    //set Model
    globSync("./db/models/*.js").forEach(async (file) => {
      const pathModel = file
        .replace(".js", "")
        .replace(/\\/g, "/")
        .replace("db", ".");
      console.log("pathModel", pathModel);
      const fileName = file
        .replace(".js", "")
        .replace(/\\/g, "/")
        .replace("db/models/", "");
      const modelDatabase = require(pathModel);
      const funcModel = await modelDatabase(sequelize, DataTypes);
      global.model[fileName] = funcModel;
    });

    //check ว่า model ตรงกับ database ใหม ไม่ตรงจะทำการปรับให้
    await sequelize.sync();

    // Associations

    return;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = initDb;
