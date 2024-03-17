const dbService = require("../services/getDBService");
const router = express.Router();
const path = require("path")
  .resolve(__dirname)
  .replace(/\\/g, "/")
  .replace(appRoot, "");

router.get(path + "/getDB/:tb", async (req, res) => {
  try {
    const { tb } = req.params;
    console.log("tb", tb);
    const tbList = [
      "cryptoBags",
      "cryptos",
      "fiat",
      "fiatBags",
      "status",
      "transaction",
      "typeTransaction",
      "users",
    ];

    if (tbList.includes(tb)) {
      const data = await dbService.getTableData(tb);
      return res.status(200).json({ code: "success", data });
    } else {
      throw new Error("db not found");
    }
  } catch (error) {
    console.log("error===>", error);
    return res.status(500).json({ code: "error" });
  }
});

module.exports = router;
