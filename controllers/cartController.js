import userModel from "../models/userModel.js"

//add items to user cart

const addToCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId); // use req.user if using authMiddleware

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Now safely access cartData
    const cart = user.cartData || {};
    const { itemId } = req.body;

    cart[itemId] = (cart[itemId] || 0) + 1;

    await userModel.findByIdAndUpdate(req.user.userId, { cartData: cart });

    res.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.log("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// remove items from user cart

const removeFromCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartData = user.cartData || {};
    const { itemId } = req.body;

    if (cartData[itemId] > 0) {
      cartData[itemId] -= 1;
    }

    await userModel.findByIdAndUpdate(req.user.userId, { cartData });

    res.json({ success: true, message: "Removed from cart" });
  } catch (error) {
    console.log("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//fetch user cart data

const getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartData = user.cartData || {};

    res.json({ success: true, cartData });
  } catch (error) {
    console.log("Get cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export {addToCart,removeFromCart,getCart}