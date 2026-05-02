const Joi = require('joi');

// Validation schemas
const schemas = {
  // User Registration
  userRegistration: Joi.object({
    name: Joi.string().required().max(50).messages({
      'string.empty': 'Name is required',
      'string.max': 'Name cannot exceed 50 characters'
    }),
    phone: Joi.string()
      .required()
      .pattern(/^[6-9]\d{9}$/)
      .messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Please provide a valid Indian phone number'
      }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email'
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters'
    })
  }),

  // User Login
  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Create Order
  createOrder: Joi.object({
    restaurant: Joi.string().required(),
    items: Joi.array()
      .min(1)
      .items(
        Joi.object({
          menuItem: Joi.string().required(),
          quantity: Joi.number().positive().required(),
          customizations: Joi.array().optional()
        })
      )
      .required(),
    deliveryAddress: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      street: Joi.string().required(),
      area: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      instructions: Joi.string().optional()
    }).required(),
    paymentMethod: Joi.string().valid('upi', 'card', 'cash_on_delivery').required()
  }),

  // Update Order Status
  updateOrderStatus: Joi.object({
    status: Joi.string()
      .valid(
        'confirmed',
        'preparing',
        'ready',
        'picked_up',
        'in_transit',
        'delivered',
        'cancelled'
      )
      .required()
  }),

  // Add Menu Item
  addMenuItem: Joi.object({
    name: Joi.string().required().max(100),
    description: Joi.string().optional(),
    category: Joi.string()
      .valid('appetizers', 'mains', 'breads', 'rice', 'desserts', 'beverages', 'sides')
      .required(),
    price: Joi.number().positive().required(),
    discountPrice: Joi.number().positive().optional(),
    isVegetarian: Joi.boolean().optional(),
    isVegan: Joi.boolean().optional(),
    preparationTime: Joi.number().positive().optional(),
    customizations: Joi.array().optional()
  }),

  // Update Menu Item
  updateMenuItem: Joi.object({
    name: Joi.string().max(100).optional(),
    description: Joi.string().optional(),
    category: Joi.string()
      .valid('appetizers', 'mains', 'breads', 'rice', 'desserts', 'beverages', 'sides')
      .optional(),
    price: Joi.number().positive().optional(),
    discountPrice: Joi.number().positive().optional(),
    isAvailable: Joi.boolean().optional(),
    isVegetarian: Joi.boolean().optional(),
    isVegan: Joi.boolean().optional()
  }),

  // Restaurant Registration
  restaurantRegistration: Joi.object({
    name: Joi.string().required().max(100),
    phone: Joi.string()
      .required()
      .pattern(/^[6-9]\d{9}$/),
    email: Joi.string().email().required(),
    cuisines: Joi.array().min(1).required(),
    address: Joi.object({
      street: Joi.string().required(),
      area: Joi.string().required(),
      zipcode: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    }).required()
  }),

  // Rate Order
  rateOrder: Joi.object({
    customerRating: Joi.number().min(1).max(5).optional(),
    driverRating: Joi.number().min(1).max(5).optional(),
    review: Joi.string().max(500).optional()
  })
};

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  schemas,
  validate
};
