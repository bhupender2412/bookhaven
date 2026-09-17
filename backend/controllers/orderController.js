const mongoose = require("mongoose");

const Order =
    require("../models/Order");

const Cart =
    require("../models/Cart");

const Book =
    require("../models/Book");

// --------------------------------------------------
// Restore stock if checkout fails
// --------------------------------------------------

const rollbackInventory =
    async (updates) => {
        for (const update of updates) {
            await Book.updateOne(
                {
                    _id: update.bookId,
                },
                {
                    $inc: {
                        stock:
                            update.quantity,

                        soldCount:
                            -update.quantity,
                    },
                }
            );
        }
    };

// --------------------------------------------------
// Create Order
// --------------------------------------------------

const createOrder = async (
    req,
    res,
    next
) => {
    const inventoryUpdates = [];

    try {
        const cart =
            await Cart.findOne({
                user:
                    req.user._id,
            }).populate(
                "items.book"
            );

        if (
            !cart ||
            cart.items.length === 0
        ) {
            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Your cart is empty",
                });
        }

        const orderItems = [];

        let itemsPrice = 0;

        // --------------------------------------------
        // Re-check each cart item against database
        // --------------------------------------------

        for (const cartItem of cart.items) {
            const bookId =
                cartItem.book?._id;

            if (!bookId) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "A book in your cart is no longer available",
                    });
            }

            const currentBook =
                await Book.findOne({
                    _id: bookId,
                    isActive: true,
                });

            if (!currentBook) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            `"${cartItem.book.title}" is no longer available`,
                    });
            }

            if (
                currentBook.stock <
                cartItem.quantity
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            `Only ${currentBook.stock} copies of "${currentBook.title}" are available`,
                    });
            }

            const unitPrice =
                currentBook.discountPrice ??
                currentBook.price;

            const itemSubtotal =
                unitPrice *
                cartItem.quantity;

            orderItems.push({
                book:
                    currentBook._id,

                title:
                    currentBook.title,

                slug:
                    currentBook.slug,

                author:
                    currentBook.author,

                coverImage:
                    currentBook.coverImage,

                quantity:
                    cartItem.quantity,

                unitPrice,

                subtotal:
                    itemSubtotal,
            });

            itemsPrice +=
                itemSubtotal;
        }

        // --------------------------------------------
        // Shipping rule
        // --------------------------------------------

        const shippingPrice =
            itemsPrice >= 999
                ? 0
                : 79;

        const totalPrice =
            itemsPrice +
            shippingPrice;

        // --------------------------------------------
        // Reserve / deduct inventory
        // --------------------------------------------

        for (const item of orderItems) {
            const updatedBook =
                await Book.findOneAndUpdate(
                    {
                        _id:
                            item.book,

                        isActive:
                            true,

                        stock: {
                            $gte:
                                item.quantity,
                        },
                    },
                    {
                        $inc: {
                            stock:
                                -item.quantity,

                            soldCount:
                                item.quantity,
                        },
                    },
                    {
                        new: true,
                    }
                );

            if (!updatedBook) {
                await rollbackInventory(
                    inventoryUpdates
                );

                return res
                    .status(409)
                    .json({
                        success: false,
                        message:
                            `Stock changed for "${item.title}". Please review your cart and try again.`,
                    });
            }

            inventoryUpdates.push({
                bookId:
                    item.book,

                quantity:
                    item.quantity,
            });
        }

        // --------------------------------------------
        // Create order
        // --------------------------------------------

        let order;

        try {
            order =
                await Order.create({
                    orderNumber:
                        Order.createOrderNumber(),

                    user:
                        req.user._id,

                    items:
                        orderItems,

                    shippingAddress:
                        req.body
                            .shippingAddress,

                    paymentMethod:
                        req.body
                            .paymentMethod ||
                        "cod",

                    itemsPrice,

                    shippingPrice,

                    totalPrice,
                });
        } catch (error) {
            await rollbackInventory(
                inventoryUpdates
            );

            throw error;
        }

        // --------------------------------------------
        // Clear Cart
        // --------------------------------------------

        try {
            cart.items = [];

            await cart.save();
        } catch (error) {
            await Order.deleteOne({
                _id: order._id,
            });

            await rollbackInventory(
                inventoryUpdates
            );

            throw error;
        }

        res.status(201).json({
            success: true,
            message:
                "Order placed successfully",
            order,
        });
    } catch (error) {
        next(error);
    }
};

// --------------------------------------------------
// Current User Orders
// --------------------------------------------------

const getMyOrders = async (
    req,
    res,
    next
) => {
    try {
        const orders =
            await Order.find({
                user:
                    req.user._id,
            })
                .sort({
                    createdAt: -1,
                })
                .select(
                    "orderNumber items itemsPrice shippingPrice totalPrice paymentMethod paymentStatus orderStatus placedAt createdAt"
                );

        res.status(200).json({
            success: true,
            count:
                orders.length,
            orders,
        });
    } catch (error) {
        next(error);
    }
};

// --------------------------------------------------
// Current User Order Details
// --------------------------------------------------

const getMyOrderById =
    async (
        req,
        res,
        next
    ) => {
        try {
            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.orderId
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid order ID",
                    });
            }

            const order =
                await Order.findOne({
                    _id:
                        req.params.orderId,

                    user:
                        req.user._id,
                });

            if (!order) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Order not found",
                    });
            }

            res.status(200).json({
                success: true,
                order,
            });
        } catch (error) {
            next(error);
        }
    };

// --------------------------------------------------
// Admin - Get All Orders
// --------------------------------------------------

const getAllOrders = async (
    req,
    res,
    next
) => {
    try {
        const {
            status,
            search = "",
            page = 1,
            limit = 20,
        } = req.query;

        const filter = {};

        if (
            status &&
            status !== "all"
        ) {
            filter.orderStatus =
                status;
        }

        if (search.trim()) {
            filter.orderNumber = {
                $regex:
                    search.trim(),

                $options: "i",
            };
        }

        const currentPage =
            Math.max(
                Number(page) || 1,
                1
            );

        const pageSize =
            Math.min(
                Math.max(
                    Number(limit) || 20,
                    1
                ),
                100
            );

        const total =
            await Order.countDocuments(
                filter
            );

        const orders =
            await Order.find(
                filter
            )
                .populate({
                    path: "user",

                    select:
                        "name email phone role",
                })
                .sort({
                    createdAt: -1,
                })
                .skip(
                    (currentPage - 1) *
                    pageSize
                )
                .limit(pageSize);

        res.status(200).json({
            success: true,

            orders,

            page:
                currentPage,

            pages:
                Math.ceil(
                    total /
                    pageSize
                ),

            total,

            limit:
                pageSize,
        });
    } catch (error) {
        next(error);
    }
};

// --------------------------------------------------
// Admin - Get Order By ID
// --------------------------------------------------

const getAdminOrderById =
    async (
        req,
        res,
        next
    ) => {
        try {
            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.orderId
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid order ID",
                    });
            }

            const order =
                await Order.findById(
                    req.params.orderId
                ).populate({
                    path: "user",

                    select:
                        "name email phone role",
                });

            if (!order) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Order not found",
                    });
            }

            res.status(200).json({
                success: true,
                order,
            });
        } catch (error) {
            next(error);
        }
    };

// --------------------------------------------------
// Admin - Update Order Status
// --------------------------------------------------

const updateOrderStatus =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                orderStatus,
            } = req.body;

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.orderId
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid order ID",
                    });
            }

            const order =
                await Order.findById(
                    req.params.orderId
                );

            if (!order) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Order not found",
                    });
            }

            if (
                order.orderStatus ===
                "cancelled"
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Cancelled orders cannot be updated",
                    });
            }

            if (
                order.orderStatus ===
                "delivered"
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Delivered orders cannot be changed",
                    });
            }

            const allowedTransitions = {
                placed: [
                    "confirmed",
                    "cancelled",
                ],

                confirmed: [
                    "processing",
                    "cancelled",
                ],

                processing: [
                    "shipped",
                    "cancelled",
                ],

                shipped: [
                    "delivered",
                    "cancelled",
                ],
            };

            const allowed =
                allowedTransitions[
                order.orderStatus
                ] || [];

            if (
                !allowed.includes(
                    orderStatus
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            `Order cannot move from ${order.orderStatus} to ${orderStatus}`,
                    });
            }

            // --------------------------------------------
            // Cancellation
            // --------------------------------------------

            if (
                orderStatus ===
                "cancelled"
            ) {
                for (
                    const item of
                    order.items
                ) {
                    await Book.updateOne(
                        {
                            _id:
                                item.book,
                        },
                        {
                            $inc: {
                                stock:
                                    item.quantity,

                                soldCount:
                                    -item.quantity,
                            },
                        }
                    );
                }

                order.orderStatus =
                    "cancelled";

                await order.save();

                return res
                    .status(200)
                    .json({
                        success: true,

                        message:
                            "Order cancelled and inventory restored",

                        order,
                    });
            }

            // --------------------------------------------
            // Normal fulfillment
            // --------------------------------------------

            order.orderStatus =
                orderStatus;

            if (
                orderStatus ===
                "delivered"
            ) {
                order.deliveredAt =
                    new Date();

                if (
                    order.paymentMethod ===
                    "cod"
                ) {
                    order.paymentStatus =
                        "paid";
                }
            }

            await order.save();

            res.status(200).json({
                success: true,

                message:
                    `Order status updated to ${orderStatus}`,

                order,
            });
        } catch (error) {
            next(error);
        }
    };

// --------------------------------------------------
// Admin - Order Statistics
// --------------------------------------------------

const getOrderStats = async (
    req,
    res,
    next
) => {
    try {
        const [
            totalOrders,
            placed,
            confirmed,
            processing,
            shipped,
            delivered,
            cancelled,
            revenueResult,
        ] = await Promise.all([
            Order.countDocuments(),

            Order.countDocuments({
                orderStatus:
                    "placed",
            }),

            Order.countDocuments({
                orderStatus:
                    "confirmed",
            }),

            Order.countDocuments({
                orderStatus:
                    "processing",
            }),

            Order.countDocuments({
                orderStatus:
                    "shipped",
            }),

            Order.countDocuments({
                orderStatus:
                    "delivered",
            }),

            Order.countDocuments({
                orderStatus:
                    "cancelled",
            }),

            Order.aggregate([
                {
                    $match: {
                        orderStatus: {
                            $ne:
                                "cancelled",
                        },
                    },
                },

                {
                    $group: {
                        _id: null,

                        revenue: {
                            $sum:
                                "$totalPrice",
                        },
                    },
                },
            ]),
        ]);

        res.status(200).json({
            success: true,

            stats: {
                totalOrders,

                placed,

                confirmed,

                processing,

                shipped,

                delivered,

                cancelled,

                revenue:
                    revenueResult[0]
                        ?.revenue || 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  getOrderStats,
};