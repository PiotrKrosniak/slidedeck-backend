'use strict';

const crypto = require('crypto');


module.exports = {
  async generateOTP(ctx) {
    const { email, domain } = ctx.request.body;

    // Validate email domain dynamically based on request
    const emailDomain = email.split('@')[1];
    if (emailDomain !== domain) {
      return ctx.badRequest('Email is not from the approved domain');
    }

    // Generate OTP
    const otp = crypto.randomBytes(3).toString('hex'); // Generate a 6-character OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

    // Store the OTP in the User_OTP collection
    await strapi.db.query('api::user-otp.user-otp').create({
      data: {
        email,
        OTP: otp,
        expires_at: expiresAt,
      },
    });

    // Send OTP via email
    await strapi.plugins['email'].services.email.send({
    from: 'no-reply@ailms.co',
      to: email,
      subject: `${otp} - Your One-Time Login Code for ${domain} LMS`,
      text: `Your login code is: ${otp}`,
    });


    try {
      return ctx.send({ message: 'OTP sent successfully check your email' });
    } catch (err) {
      console.error(err);
      return ctx.internalServerError('Failed to send OTP');
    }
  },
  async verifyOTP(ctx) {
    const { email, otp, organizationId } = ctx.request.body;
    console.log(email, otp, organizationId);
    console.log(ctx.request.body);
  
    // Find the OTP record associated with the email
    const otpRecord = await strapi.db.query('api::user-otp.user-otp').findOne({
      where: { email },
    });


  
    if (!otpRecord) {
      return ctx.badRequest('No OTP found for this email');
    }
    // Check if the user already exists in the `lms-users` collection
  let lmsUser = await strapi.db.query('api::lms-user.lms-user').findOne({
    where: { email },
  });

  if (!lmsUser) {
    // If the user doesn't exist, create a new one
    lmsUser = await strapi.db.query('api::lms-user.lms-user').create({
      data: {
        email,
        organization: organizationId, // Ensure 'organization' is the correct field name and relation in the content type
      },
    });
  } else {
    // If the user exists, update their organizationId
    lmsUser = await strapi.db.query('api::lms-user.lms-user').update({
      where: { email },
      data: {
        organization: organizationId, // Update the organizationId for the existing user
      },
    });
  }

    // (Optional) Generate and return a JWT token if needed for session management
    const token = strapi.plugins['users-permissions'].services.jwt.issue({
      id: lmsUser.id,  // Use the user's ID or email for the token
      email: lmsUser.email,
    });
  
    const { OTP, expires_at, attempts } = otpRecord;
  
  
    // Convert expires_at to a Date object if needed
    const expirationTime = new Date(expires_at).getTime();
    const currentTime = Date.now();
  
  
    // Check if OTP has expired
    if (currentTime > expirationTime) {
      console.log('OTP has expired.');
      await strapi.db.query('api::user-otp.user-otp').delete({ where: { email } });
      return ctx.badRequest('OTP has expired');
    }
  
    // Check if OTP matches
    if (OTP === otp) {
      // OTP is valid, delete the OTP and return success
      await strapi.db.query('api::user-otp.user-otp').delete({ where: { email } });
      return ctx.send({ 
        message: 'verified',
        token: token,
        lmsUser: lmsUser
      });
    } else {
  
      // Increment the attempts counter
      const newAttempts = attempts + 1;
  
      // Check if max attempts reached
      if (newAttempts >= 4) {
        console.log('Too many failed attempts, deleting OTP.');
        await strapi.db.query('api::user-otp.user-otp').delete({ where: { email } });
        return ctx.badRequest('Too many failed attempts, OTP has been deleted');
      }
  
      // Update attempts count
      await strapi.db.query('api::user-otp.user-otp').update({
        where: { email },
        data: { attempts: newAttempts },
      });
  
      return ctx.badRequest('wrong otp');
    }
  }
  
};
