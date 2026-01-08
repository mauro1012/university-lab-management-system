const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { userId } = req.body;

  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
};
