import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

export const isDatabricksInternal = (req, res, next) => {
  const databricksRoles = ['admin', 'databricks_ae', 'databricks_csm', 'databricks_sa', 
                            'databricks_dsa', 'databricks_partner', 'databricks_leadership'];
  if (!req.user || !databricksRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Databricks internal access required' });
  }
  next();
};

export const isCustomer = (req, res, next) => {
  const customerRoles = ['customer_executive', 'customer_lead', 'customer_champion', 
                         'customer_member', 'customer_trainer'];
  if (!req.user || !customerRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Customer access required' });
  }
  next();
};


