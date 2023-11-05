const jwt = require("jsonwebtoken");
require("dotenv").config();

const tokenDeclared = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if(!bearerHeader) {
    return res.status(403).send({
        "code": "403",
        "msg": "Authentication failed"
    });
  }
  try {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    const decoded = jwt.verify(bearerToken, tokenDeclared);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send({
        "code": "401",
        "msg":"Invalid Token"
    });
  }
  return next();
};

//To verify the current user is admin or not
const verifyRole = (req, res, next) => {
    const userRole = req.user.role;
  
    if(!userRole) {
      return res.status(400).send({
          "code": "400",
          "msg": "Invalid request"
      });
    }
    
    if(userRole != 1){
        return res.status(400).send({
            "code": "401",
            "msg": "You are not authorized to view this page"
        });
    }
    else{
        return next();
    }
};

module.exports = {verifyToken, verifyRole};