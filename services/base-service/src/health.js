module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'base-service',
    timestamp: new Date()
  });
};
