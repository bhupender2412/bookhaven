const mongoose =
    require("mongoose");

const Wishlist =
    require("../models/Wishlist");

const Book =
    require("../models/Book");

const populateWishlist =
    async (wishlist) => {
        await wishlist.populate({
            path: "books",

            match: {
                isActive: true,
            },

            select:
                "title slug author price discountPrice coverImage stock featured isActive averageRating reviewCount category",

            populate: {
                path: "category",
                select: "name slug",
            },
        });

        return wishlist;
    };

// --------------------------------------------------
// Get Wishlist
// --------------------------------------------------

const getWishlist =
    async (
        req,
        res,
        next
    ) => {
        try {
            let wishlist =
                await Wishlist.findOne({
                    user:
                        req.user._id,
                });

            if (!wishlist) {
                wishlist =
                    await Wishlist.create({
                        user:
                            req.user._id,

                        books: [],
                    });
            }

            await populateWishlist(
                wishlist
            );

            res.status(200).json({
                success: true,

                wishlist: {
                    _id:
                        wishlist._id,

                    books:
                        wishlist.books,

                    count:
                        wishlist.books
                            .length,
                },
            });
        } catch (error) {
            next(error);
        }
    };

// --------------------------------------------------
// Add To Wishlist
// --------------------------------------------------

const addToWishlist =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                bookId,
            } = req.params;

            if (
                !mongoose.Types.ObjectId.isValid(
                    bookId
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid book ID",
                    });
            }

            const book =
                await Book.findOne({
                    _id:
                        bookId,

                    isActive:
                        true,
                });

            if (!book) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Book not found or unavailable",
                    });
            }

            let wishlist =
                await Wishlist.findOne({
                    user:
                        req.user._id,
                });

            if (!wishlist) {
                wishlist =
                    await Wishlist.create({
                        user:
                            req.user._id,

                        books: [],
                    });
            }

            const alreadySaved =
                wishlist.books.some(
                    (id) =>
                        id.toString() ===
                        bookId
                );

            if (alreadySaved) {
                await populateWishlist(
                    wishlist
                );

                return res
                    .status(200)
                    .json({
                        success: true,

                        message:
                            "Book is already in your wishlist",

                        wishlist: {
                            _id:
                                wishlist._id,

                            books:
                                wishlist.books,

                            count:
                                wishlist.books
                                    .length,
                        },
                    });
            }

            wishlist.books.push(
                book._id
            );

            await wishlist.save();

            await populateWishlist(
                wishlist
            );

            res.status(200).json({
                success: true,

                message:
                    "Book added to wishlist",

                wishlist: {
                    _id:
                        wishlist._id,

                    books:
                        wishlist.books,

                    count:
                        wishlist.books
                            .length,
                },
            });
        } catch (error) {
            next(error);
        }
    };

// --------------------------------------------------
// Remove From Wishlist
// --------------------------------------------------

const removeFromWishlist =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                bookId,
            } = req.params;

            if (
                !mongoose.Types.ObjectId.isValid(
                    bookId
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid book ID",
                    });
            }

            const wishlist =
                await Wishlist.findOne({
                    user:
                        req.user._id,
                });

            if (!wishlist) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Wishlist not found",
                    });
            }

            const originalLength =
                wishlist.books.length;

            wishlist.books =
                wishlist.books.filter(
                    (id) =>
                        id.toString() !==
                        bookId
                );

            if (
                wishlist.books.length ===
                originalLength
            ) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Book is not in your wishlist",
                    });
            }

            await wishlist.save();

            await populateWishlist(
                wishlist
            );

            res.status(200).json({
                success: true,

                message:
                    "Book removed from wishlist",

                wishlist: {
                    _id:
                        wishlist._id,

                    books:
                        wishlist.books,

                    count:
                        wishlist.books
                            .length,
                },
            });
        } catch (error) {
            next(error);
        }
    };

// --------------------------------------------------
// Clear Wishlist
// --------------------------------------------------

const clearWishlist =
    async (
        req,
        res,
        next
    ) => {
        try {
            let wishlist =
                await Wishlist.findOne({
                    user:
                        req.user._id,
                });

            if (!wishlist) {
                wishlist =
                    await Wishlist.create({
                        user:
                            req.user._id,

                        books: [],
                    });
            } else {
                wishlist.books = [];

                await wishlist.save();
            }

            res.status(200).json({
                success: true,

                message:
                    "Wishlist cleared successfully",

                wishlist: {
                    _id:
                        wishlist._id,

                    books: [],

                    count: 0,
                },
            });
        } catch (error) {
            next(error);
        }
    };

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
};