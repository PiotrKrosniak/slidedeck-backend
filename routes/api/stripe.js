const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  const { product, customer_id } = req.body;

  try {
    let customer;

    // Check if the customer exists
    try {
      customer = await stripe.customers.retrieve(customer_id);
      if (customer.deleted) {
        // If customer was deleted, create a new one
        throw new Error("Customer is deleted");
      }
    } catch (err) {
      // If customer does not exist, create a new customer
      if (
        err.type === "StripeInvalidRequestError" &&
        err.message.includes("No such customer")
      ) {
        customer = await stripe.customers.create({
          id: customer_id,
        });
      } else {
        throw err;
      }
    }
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: product.name,
            },
            unit_amount: product.price * 100,
          },
          quantity: product.quantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONT_END_URL}/success`,
      cancel_url: `${process.env.FRONT_END_URL}/cancel`,
    });
    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/customer/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    customer = await stripe.customers.retrieve(userId);
    if (customer.deleted) {
      res.status(500).json({ error: "Customer is deleted" });
    }
    // Retrieve charges for the customer
    const charges = await stripe.charges.list({
      customer: userId,
    });
    const payment_list = (charges?.data || []).map((i) => ({
      id: i.id,
      amount: i.amount,
      paid: i.paid,
      receipt_url: i.receipt_url,
      status: i.status,
    }));
    res.json({
      customer: { ...customer, payment_list },
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
