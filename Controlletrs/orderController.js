const Order = require('../Models/orderModel');   
const ServiceItem = require('../Models/ServiceItem');
const { Cart, CartItem } = require('../Models/cartModel');
const PlatformSettings = require('../models/platformSettings');
exports.getPlatformAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const settings = await PlatformSettings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Platform settings not found' });
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.updatePlatformAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { available } = req.body;

    const settings = await PlatformSettings.findOneAndUpdate(
      {},
      { available },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Platform availability updated', settings });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.AddToCart = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user.id;

    const serviceItem = await ServiceItem.findById(id).populate('categoryId', 'maincategory subcategory mainphoto');

    if (!serviceItem) {
      return res.status(404).json({ message: "Service item not found" });
    }
    let cartItem = await CartItem.findOne({
      userId,
      items: { $in: [serviceItem._id] }
    });

    if (cartItem) {
      cartItem.quantity += 1;
      cartItem.totalPrice = cartItem.quantity * serviceItem.price;
      await cartItem.save();

      return res.status(200).json({ message: "Item quantity updated", cartItem });
    }
    cartItem = new CartItem({
      userId,
      items: [serviceItem._id],
      quantity: 1,
      totalPrice: serviceItem.price
    });
    await cartItem.save();
    let cart = await Cart.findOne({ userId, serviceId: serviceItem.serviceId });

    if (!cart) {
      cart = new Cart({
        userId,
        cartitemId: cartItem._id,
        serviceId: serviceItem.serviceId
      });
      await cart.save();
    }

    return res.status(201).json({ message: "Item added to cart", cartItem, cart });
  } catch (error) {
    console.error("AddToCart Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

  
  
exports.Cart = async (req, res) => {
    try {
    const userId = req.user.id;
    const carts = await Cart.find({ userId })
      .populate({
        path: 'cartitemId',
        populate: {
          path: 'items',
          model: 'ServiceItem',
          select: 'name price image'
        }
      });
    const cartDetails = carts.map(cart => {
      const cartItem = cart.cartitemId;
      return cartItem.items.map(serviceItem => ({
        cartItemId: cartItem._id,
        serviceItemId: serviceItem._id,
        name: serviceItem.name,
        price: serviceItem.price,
        image: serviceItem.image,
        quantity: cartItem.quantity,
        totalPrice: cartItem.totalPrice
      }));
    }).flat();

    res.status(200).json(cartDetails);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
exports.RemoveFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.body;
    const userId = req.user.id;

    if (!cartItemId) {
      return res.status(400).json({ message: "CartItem ID is required" });
    }

   
    const cart = await Cart.findOneAndDelete({
      userId,
      cartitemId: cartItemId
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    await CartItem.findByIdAndDelete(cartItemId);

    res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.CreateOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemIds } = req.body;

    if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) {
      return res.status(400).json({ message: "No cart items selected" });
    }
    const cartEntries = await Cart.find({
      userId,
      cartitemId: { $in: cartItemIds }
    }).populate({
      path: 'cartitemId',
      populate: {
        path: 'items',
        model: 'ServiceItem',
        select: 'name price image'
      }
    });

    if (cartEntries.length === 0) {
      return res.status(404).json({ message: "No matching cart items found" });
    }

    let totalPrice = 0;
    const orderItems = [];
    for (const cart of cartEntries) {
      const cartItem = cart.cartitemId;
      for (const serviceItem of cartItem.items) {
        const serItem = await ServiceItem.findById(serviceItem._id);

        if (!serItem) {
          return res.status(400).json({ message: `Service item not found: ${serviceItem._id}` });
        }
        const quantity = cartItem.quantity;
        const itemTotal = serItem.price * quantity;

        totalPrice += itemTotal;

        orderItems.push({
          serviceItemId: serItem._id,
          name: serItem.name,
          price: serItem.price,
          image: serItem.image,
          quantity,
          total: itemTotal
        });
      }
    }
    const order = new Order({
      userId,
      items: orderItems,
      totalPrice,
      status: 'pending'
    });

    await order.save();
    await Cart.deleteMany({ cartitemId: { $in: cartItemIds }, userId });
    await CartItem.deleteMany({ _id: { $in: cartItemIds } });

    return res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id,
      items: orderItems,
      totalPrice
    });

  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.Checkout = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(403).json({ message: "Access denied" });
      }
        const {username}= req.user.name
      const userId = req.user.id;
      const { orderId } = req.body;
      const {phonenumber}=req.body;
  
      const order = await Order.findOne({ orderId:orderId, userId });
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      if (order.Checkedout) {
        return res.status(400).json({ message: "Order is already checked out" });
      }
  
      const checkoutRecords = [];
  
      for (const item of order.products) {
        const checkout = new Checkout({
            username:username,
            phonenumber:phonenumber,
            productId: item.productId,
            orderId: order.orderId,
            totalPrice:order.totalPrice,
            checkoutDate: new Date(), 
                DeleverDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                Orderstatus: "Coming to you", 
        });
  
        await checkout.save();
        checkoutRecords.push(checkout);
      }
      
      order.Checkedout = true;
      order.status ="coming to you"
      await order.save();
  
      res.status(200).json({
        message: "Checkout completed successfully",
        data:phonenumber,
        checkouts: checkoutRecords,
      });
  
    } catch (error) {
      console.error("Error during checkout:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };
  



exports.Allorders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId });
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.OrderDetails = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


exports.CancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!Array.isArray(order.items)) {
      return res.status(400).json({ message: "Invalid order items data" });
    }

    for (const item of order.items) {
      await ServiceItem.findByIdAndUpdate(
        item.serviceItemId,
        { $inc: { stockQuantity: item.quantity } },
        { new: true }
      );
    }

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({ message: "Order cancelled and stock (if managed) updated", order });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};