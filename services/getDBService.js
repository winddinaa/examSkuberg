const dbService = {
  getTableData: async (tableName) => {
    try {
      const data = await model[tableName].findAll();
      return data;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = dbService;
