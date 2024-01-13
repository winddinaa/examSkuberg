module.exports = async (sequelize, DataTypes) => {
  const Transaction = await sequelize.define(
    "transaction",
    {
      transactionID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      cryptoID: { type: DataTypes.INTEGER, allowNull: true },
      fiatID: { type: DataTypes.INTEGER, allowNull: true },
      ownerCryptoBagID: { type: DataTypes.INTEGER, allowNull: true },
      ownerFiatBagID: { type: DataTypes.INTEGER, allowNull: true },
      targetCryptoBagID: { type: DataTypes.INTEGER, allowNull: true },
      targetFiatBagID: { type: DataTypes.INTEGER, allowNull: true },
      statusID: { type: DataTypes.INTEGER, allowNull: false },
      transactionType: { type: DataTypes.STRING, allowNull: false },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      targetOrder: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      refTransaction: { type: DataTypes.INTEGER, allowNull: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: true },
      updated_by: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      freezeTableName: true,
      timestamps: false,
      // ถ้าคุณไม่ต้องการให้ Sequelize สร้างคอลัมน์ createdAt และ updatedAt ให้กำหนด timestamps เป็น false
    }
  );

  return Transaction;
};
