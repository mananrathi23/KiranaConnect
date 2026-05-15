import PDFDocument from 'pdfkit';

export const generateInvoiceBuffer = (order, shopOwnerName, emailItemsList) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc
        .fillColor('#444444')
        .fontSize(20)
        .text('KiranaConnect', 50, 57)
        .fontSize(10)
        .text('B2B Wholesale Platform', 50, 80)
        .text('info@kiranaconnect.com', 50, 95)
        .moveDown();

      // Invoice Info
      doc
        .fillColor('#000000')
        .fontSize(20)
        .text('INVOICE', 50, 160);

      doc
        .fontSize(10)
        .text(`Invoice Number: ${order._id}`, 50, 200)
        .text(`Invoice Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`, 50, 215)
        .text(`Status: ${order.status || 'PENDING'}`, 50, 230);

      // Bill To
      doc
        .text('Bill To:', 300, 200)
        .font('Helvetica-Bold')
        .text(shopOwnerName || 'Shop Owner', 300, 215)
        .font('Helvetica')
        .moveDown();

      // Table Header
      const invoiceTableTop = 330;
      doc.font('Helvetica-Bold');
      doc.text('Item', 50, invoiceTableTop);
      doc.text('Unit Price', 280, invoiceTableTop, { width: 90, align: 'right' });
      doc.text('Quantity', 370, invoiceTableTop, { width: 90, align: 'right' });
      doc.text('Line Total', 470, invoiceTableTop, { width: 90, align: 'right' });
      doc.moveTo(50, invoiceTableTop + 15).lineTo(560, invoiceTableTop + 15).stroke();

      // Table Rows
      doc.font('Helvetica');
      let position = invoiceTableTop + 30;

      for (let i = 0; i < emailItemsList.length; i++) {
        const item = emailItemsList[i];
        const lineTotal = item.priceAtPurchase * item.quantity;

        doc.text(item.productName || 'Product', 50, position);
        doc.text(`Rs. ${item.priceAtPurchase}`, 280, position, { width: 90, align: 'right' });
        doc.text(item.quantity, 370, position, { width: 90, align: 'right' });
        doc.text(`Rs. ${lineTotal}`, 470, position, { width: 90, align: 'right' });

        position += 20;
      }

      // Total
      doc.moveTo(50, position).lineTo(560, position).stroke();
      position += 15;
      doc.font('Helvetica-Bold');
      doc.text('Total Amount:', 370, position, { width: 90, align: 'right' });
      doc.text(`Rs. ${order.totalAmount}`, 470, position, { width: 90, align: 'right' });

      // Footer
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(
          'Thank you for your business. For any issues with this order, please contact support.',
          50,
          700,
          { align: 'center', width: 500 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
