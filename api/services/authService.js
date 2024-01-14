const isEmpty = require("is-empty");
const { jwtToken } = require("../../utils/auth");

const authService = {
  loginUser: async (username, password) => {
    try {
      const user = await model.users.findOne({
        raw: true,
        where: { username: username },
      });

      if (
        !isEmpty(user) &&
        user.username == username &&
        user.password == password
      ) {
        const bodyEncrypt = {
          userID: user.userID,
        };
        const token = jwtToken(bodyEncrypt);
        return token;
      } else {
        throw new Error("db not found");
      }
    } catch (error) {
      throw error;
    }
  },
};

module.exports = authService;
