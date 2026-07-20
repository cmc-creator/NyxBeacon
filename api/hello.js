module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    message: 'Hello from Vercel Serverless!',
    timestamp: new Date().toISOString(),
    path: req.url
  });
};
