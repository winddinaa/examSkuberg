module.exports = async (sequelize, DataTypes) => {
  const FiatBag = await sequelize.define(
    "fiatBags",
    {
      fiatBagID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      fiatID: { type: DataTypes.INTEGER, allowNull: false },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      pendingAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
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

  return FiatBag;
};
