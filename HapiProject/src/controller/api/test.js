const Joi = require("joi");

const registerUser = {
  auth: false,
  tags: ["api", "User"],
  description: "Register User",
  validate: {
    payload: {
      firstName: Joi.string().required().trim(),
      middleName: Joi.string().required().trim(),
      lastName: Joi.string().required().trim(),
      email: Joi.string().required().trim(),
      mobile: Joi.number().required(),
      password: Joi.string().required()
    }
  },
  async handler(req, h) {
    try {
      let userExist = `SELECT count(1) from userdata where email='${req.payload.email}'`;
      const resultOfUser = await req.pool.query(userExist);
      if (resultOfUser.rows[0].count != 0) {
        return {
          ResultCode: 101,
          ReturnMessage: `User Already Exist! Try To LogIn`
        }
      }
      let insertsRecord = `INSERT INTO userdata (firstname,middlename,lastname,email,mobile,password,active)
                VALUES ('${req.payload.firstName}','${req.payload.middleName}','${req.payload.lastName}','${req.payload.email}',${req.payload.mobile},'${req.payload.password}',true)`;
      await req.pool.query(insertsRecord);
      return {
        ResultCode: 100,
        ReturnMessage: `Resgistration Successful`
      }
    } catch (err) {
      return {
        ResultCode: 103,
        ReturnMessage: err.message
      };
    }
  }
};

const loginUser = {
  auth: false,
  tags: ["api", "User"],
  description: "Login User",
  validate: {
    payload: {
      email: Joi.string().required().trim(),
      password: Joi.string().required()
    }
  },
  async handler(req, h) {
    try {
      let userExist = `SELECT userid from userdata where email='${req.payload.email}' AND password='${req.payload.password}'`;
      const resultOfUser = await req.pool.query(userExist);
      if (resultOfUser.rowCount != 0) {
        return {
          ResultCode: 100,
          ReturnMessage: `Login Successful`
        }
      }
      return {
        ResultCode: 101,
        ReturnMessage: `Invalid User Credentials`
      }
    } catch (err) {
      return {
        ResultCode: 103,
        ReturnMessage: err.message
      };
    }
  }
};

const getProductDetails = {
  auth: false,
  tags: ["api", "Product"],
  description: "Get Product Details",
  async handler(req, h) {
    try {
      let getProductDetailsQuery = `SELECT p.productid,p.productname,p.description,p.price,p.visibility,p.quantity,p.userid FROM productdata p inner join userdata u on p.userid=u.userid WHERE visibility = true AND u.active=true`;
      const resultOfProductDetails = await req.pool.query(getProductDetailsQuery);
      if (resultOfProductDetails.rowCount == 0) {
        return {
          ResultCode: 101,
          ReturnMessage: `Product's Not Available`
        }
      }
      return {
        ResultCode: 101,
        ReturnMessage: `Product Details Found`,
        ResponseData: resultOfProductDetails.rows
      }
    } catch (err) {
      return {
        ResultCode: 103,
        ReturnMessage: err.message
      };
    }
  }
};

const updateOrDeleteUser = {
  auth: false,
  tags: ["api", "Product"],
  description: "Make user as inactive / delete user",
  validate: {
    payload: {
      userId: Joi.number().required(),
      activeStatus: Joi.boolean().optional()
    }
  },
  async handler(req, h) {
    try {
      let getUser = `SELECT active from userdata where userid=${req.payload.userId}`;
      const userResult = await req.pool.query(getUser);
      if (userResult.rowCount == 0) {
        return {
          ResultCode: 101,
          ReturnMessage: `User Not Exist`
        }
      }
      if (req.payload.activeStatus==null) {
        let deleteRecord = `DELETE FROM userdata WHERE userid=${req.payload.userId}`;
        await req.pool.query(deleteRecord);
        return {
          ResultCode: 100,
          ReturnMessage: `User Deleted Successfully`,
        }
      }
      if (userResult.rows[0].active == req.payload.activeStatus) {
        return {
          ResultCode: 101,
          ReturnMessage: `User is already ${req.payload.activeStatus==true ? 'Active':'InActive'}`,
        }
      }
      let updateUserRecord = `UPDATE userdata SET active = ${req.payload.activeStatus} WHERE userid=${req.payload.userId}`;
      await req.pool.query(updateUserRecord);
      return {
        ResultCode: 100,
        ReturnMessage: `User Updated Successfully`,
      }
    } catch (err) {
      return {
        ResultCode: 103,
        ReturnMessage: err.message
      };
    }
  }
};

const updateProductDetails = {
  auth: false,
  tags: ["api", "Product"],
  description: "update product details",
  validate: {
    payload: {
      productId: Joi.number().required(),
      visibility: Joi.boolean().optional(),
      price:Joi.number().optional(),
      quantity:Joi.number().optional()
    }
  },
  async handler(req, h) {
    try {
      let getProduct = `SELECT visibility,price,quantity from productdata where productid=${req.payload.productId}`;
      const productResult = await req.pool.query(getProduct);
      if (productResult.rowCount == 0) {
        return {
          ResultCode: 101,
          ReturnMessage: `Product Details Not Found`
        }
      }
      let updateProductDetails = `UPDATE productdata SET visibility = ${req.payload.visibility!=null ? `${req.payload.visibility}` : `${productResult.rows[0].visibility}`}, price = ${req.payload.price ? `${req.payload.price}` : `${productResult.rows[0].price}`},quantity=${req.payload.quantity ? `${req.payload.quantity}` : `${productResult.rows[0].quantity}`} WHERE productid=${req.payload.productId}`;
      await req.pool.query(updateProductDetails);
      return {
        ResultCode: 100,
        ReturnMessage: `Product Details Updated Successfully`,
      }
    } catch (err) {
      return {
        ResultCode: 103,
        ReturnMessage: err.message
      };
    }
  }
};

const deleteProducts = {
  auth: false,
  tags: ["api", "Product"],
  description: "Delete multiple products",
  validate: {
    payload: {
      productIds: Joi.array().required()
    }
  },
  async handler(req, h) {
    try {
      let pid=[];
      let productIdsTostring =  req.payload.productIds.join(",");
      let getProductQuery = `SELECT productId from productdata where productid IN (${productIdsTostring})`;
      const getProductResult = await req.pool.query(getProductQuery);
      if (getProductResult.rowCount == 0) {
        return {
          ResultCode: 101,
          ReturnMessage: `Product Details Not Found`
        }
      }
      getProductResult.rows.map(item=>{
        pid.push(item.productid)
      })
      let deleteProductQuery = `DELETE FROM productdata Where productId IN (${pid})`;
      await req.pool.query(deleteProductQuery);
      return {
        ResultCode: 100,
        ReturnMessage: `Product Info Deleted Successfully`,
      }
    } catch (err) {
      return {
        ResultCode: 103,
        ReturnMessage: err.message
      };
    }
  }
};

const addProductDetails = {
  auth: false,
  tags: ["api", "User"],
  description: "Register User",
  validate: {
    payload: {
      productname: Joi.string().required().trim(),
      description: Joi.string().required().trim(),
      price: Joi.number().required(),
      quantity: Joi.number().required(),
      userid: Joi.number().required()
    }
  },
  async handler(req, h) {
    try {
      let insertRecord = `INSERT INTO productdata (productname,description,price,quantity,userid,visibility)
                VALUES ('${req.payload.productname}','${req.payload.description}',${req.payload.price},${req.payload.quantity},${req.payload.userid},true)`;
      await req.pool.query(insertRecord);
      return {
        ResultCode: 100,
        ReturnMessage: `Product Info Added Successful`
      }
    } catch (err) {
      return {
        ResultCode: 103,
        ReturnMessage: err.message
      };
    }
  }
};
exports.routes = [{
    method: "POST",
    path: "/registerUser",
    config: registerUser
  },
  {
    method: "POST",
    path: "/loginUser",
    config: loginUser
  },
  {
    method: "GET",
    path: "/getProductDetails",
    config: getProductDetails
  },
  {
    method: "POST",
    path: "/updateOrDeleteUser",
    config: updateOrDeleteUser
  },
  {
    method: "PUT",
    path: "/updateProductDetails",
    config: updateProductDetails
  },
  {
    method: "DELETE",
    path: "/deleteProducts",
    config: deleteProducts
  },
  {
    method: "POST",
    path: "/addProductDetails",
    config: addProductDetails
  }
]
