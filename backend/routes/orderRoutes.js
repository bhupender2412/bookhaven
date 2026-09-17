const express =
  require("express");

const {
  createOrder,
  getMyOrders,
  getMyOrderById,

  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  getOrderStats,
} = require("../controllers/orderController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  validateBody,
} = require("../middleware/validateMiddleware");

const {
  createOrderSchema,
  updateOrderStatusSchema,
} = require("../validators/orderValidators");

const router =
  express.Router();

router.use(protect);

router.post(
  "/",
  validateBody(
    createOrderSchema
  ),
  createOrder
);

router.get(
  "/my",
  getMyOrders
);

router.get(
  "/my/:orderId",
  getMyOrderById
);

router.get(
  "/admin/stats",
  authorize("admin"),
  getOrderStats
);

router.get(
  "/admin/all",
  authorize("admin"),
  getAllOrders
);

router.get(
  "/admin/:orderId",
  authorize("admin"),
  getAdminOrderById
);

router.patch(
  "/admin/:orderId/status",
  authorize("admin"),
  validateBody(
    updateOrderStatusSchema
  ),
  updateOrderStatus
);

module.exports = router;