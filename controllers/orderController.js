import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

//placing user order for frontend
const placeOrder = async (req, res) => {

    const frontend_url = "http://localhost:5173";

    try {
        const newOrder = new orderModel({
            userId: req.user.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.user.userId, { cartData: {} });

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100 * 80
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 2 * 100 * 80
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        })
        res.json({ success: true, session_url: session.url })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const verifyOrder = async (req,res) => {
   const {orderId,success} = req.body;
   try{
    if(success=="true"){
        await orderModel.findByIdAndUpdate(orderId,{payment:true});
        res.json({success:true,message:"paid"})
    }
    else{
        await orderModel.findByIdAndDelete(orderId);
        res.json({success:false,message:"Not Paid"})
    }
   }catch(error){
    console.log(error);
    res.json({success:false,message:"Error"})
   }
}

//user orders for frontend
const userOrders = async (req, res) => {
  try {
    console.log("req.user in userOrders:", req.user); // Debug log (optional)
    const orders = await orderModel.find({ userId: req.user.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Listing orders for admin panel
const listOrders = async (req,res) => {
  try{
    const orders = await orderModel.find({});
    res.json({success:true,data:orders})
  }catch(error){
    console.log(error);
    res.json({success:false,message:"Error"})
  }
}

// api for updating order status

// const updateStatus = async (req,res) =>{
//     console.log("DEBUG req.body:", req.body);
//   try{
//     await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
//     res.json({success:true,message:"Status Updated"})
//   }catch(error){
//     console.log(error);
//     res.json({success:false,message:"Error"})
//   }
// } 

 const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body || {}; // prevent destructuring from undefined

    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: "orderId and status are required" });
    }

    const updated = await orderModel.findByIdAndUpdate(orderId, { status });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log("Error in updateStatus:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export { placeOrder,verifyOrder,userOrders,listOrders,updateStatus}