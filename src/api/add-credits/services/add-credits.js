
class AddCreditsService {

    async #addCredits(stripeData) {
        try {
            const { email, credits } = stripeData;

            const user = await strapi.db.query('plugin::users-permissions.user').findOne({
                where: { email },
            });
            if (!user) {
                throw new Error(`User not found with email: ${email}`);
            }

            const updatedUser = await strapi.db.query('plugin::users-permissions.user').update({
                where: { email },
                data: {
                    credits: parseInt(user.credits) + parseInt(credits),
                },
            });
            return updatedUser;
        } catch (error) {
            throw new Error(`There has been an error while adding credits: ${error.message}`);
        }
    }

    async handleStripeWebhook(stripeData) {
        return this.#addCredits(stripeData);
    }
}

module.exports = new AddCreditsService();