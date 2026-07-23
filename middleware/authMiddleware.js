import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;

if (!authHeader) {
  return res.status(401).json({
    success: false,
    message: "Please login first",
  });
}

const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

// Admin
export const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied. Admin Only",
      });
    }

    next();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};