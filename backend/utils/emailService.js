import nodemailer from 'nodemailer';
import { generateInvoiceBuffer } from './invoiceGenerator.js';

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOrderConfirmation = async (userEmail, orderDetails, emailItemsList) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Skipping email send: EMAIL_USER or EMAIL_PASS not configured in .env');
    return;
  }

  const itemsList = emailItemsList.map(item => `- ${item.productName} (x${item.quantity}) - ₹${item.priceAtPurchase * item.quantity}`).join('\n');

  let attachments = [];
  try {
    const pdfBuffer = await generateInvoiceBuffer(orderDetails, 'Shop Owner', emailItemsList);
    attachments.push({
      filename: `Invoice_${orderDetails._id}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    });
  } catch (err) {
    console.error('Failed to generate PDF for email:', err);
  }

  const mailOptions = {
    from: `"KiranaConnect" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Order Confirmation - KiranaConnect (#${orderDetails._id})`,
    text: `Hello,\n\nThank you for your order! Your order has been placed successfully and will be processed in the next batch.\n\nOrder Details:\n${itemsList}\n\nTotal Amount: ₹${orderDetails.totalAmount}\n\nPlease find your invoice attached.\n\nBest regards,\nThe KiranaConnect Team`,
    attachments
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

export const sendBatchDispatchNotification = async (userEmail, userName, batchDetails) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Skipping email send: EMAIL_USER or EMAIL_PASS not configured in .env');
    return;
  }

  const mailOptions = {
    from: `"KiranaConnect" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Order Dispatched - KiranaConnect`,
    text: `Hello ${userName},\n\nGreat news! Your recent orders assigned to batch #${batchDetails._id} have been dispatched and are on their way.\n\nYou can track the delivery status on your dashboard.\n\nBest regards,\nThe KiranaConnect Team`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Batch dispatch email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending batch dispatch email:', error);
  }
};
