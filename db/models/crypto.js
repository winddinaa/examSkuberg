module.exports = async (sequelize, DataTypes) => {
  const Crypto = await sequelize.define(
    "cryptos",
    {
      cryptoID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      currencyName: { type: DataTypes.STRING, allowNull: false },
      price: { type: DataTypes.DECIMAL(20, 2), allowNull: false },
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

  return Crypto;
};
