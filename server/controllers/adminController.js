exports.loginAdmin = async (req, res) => {
  try {
    console.log('Headers:', req.headers['content-type']);
    const { username, password } = req.body;

    // Hardcoded credentials
    if (username === 'admin' && password === 'admin123') {
      return res.status(200).json({
        success: true,
        token: 'dummy-admin-token',
        user: {
            username: 'admin',
            role: 'admin'
        }
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
