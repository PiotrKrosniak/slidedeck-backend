# Creating Subscription and Credit Plan Products in Stripe

## Subscription Product
To create a subscription-type product in Stripe, follow these steps:

1. **Create the product** in Stripe.
2. **Add two pricing options:**
   - Monthly price
   - Annual price
3. **Include metadata for each price:**
   - Add a `credits` attribute to specify the number of credits included in the subscription.
   - Define all features of the plan using the `feature` prefix, e.g., `feature1`, `feature2`, `feature3`, etc.

## Credit Plan Product
To create a credit-based product in Stripe:

1. **Create the product** with:
   - A name
   - A description
2. **Include metadata:**
   - Add a `credits` attribute to specify the number of credits included in the plan.

