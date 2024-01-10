module.exports = async (sequelize, DataTypes) => {
  const CryptoBag = await sequelize.define(
    "cryptoBags",
    {
      cryptoBagID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      cryptoID: { type: DataTypes.INTEGER, allowNull: false },
      amount: { type: DataTypes.DECIMAL(20, 8), allowNull: false },
      pendingAmount: { type: DataTypes.DECIMAL(20, 8), allowNull: false },
      totalAmount: { type: DataTypes.DECIMAL(20, 8), allowNull: false },
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

  return CryptoBag;
};
