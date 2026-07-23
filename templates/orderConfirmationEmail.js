const orderConfirmationEmail = (order) => {
  const items = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">
          ${item.name}
        </td>

        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">
          ${item.quantity}
        </td>

        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">
          Rs. ${item.price}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Order Confirmation</title>
</head>

<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="600" style="background:#fff;margin-top:40px;border-radius:10px;overflow:hidden;">

<tr>
<td style="background:#16a34a;color:#fff;padding:25px;text-align:center;font-size:28px;font-weight:bold;">
FreshBite 🍔
</td>
</tr>

<tr>
<td style="padding:35px;">

<h2>Order Confirmed ✅</h2>

<p>Thank you for your order.</p>

<p>
<strong>Order Number:</strong>
${order.orderNumber}
</p>

<table width="100%" cellspacing="0" cellpadding="0">

<tr>
<th align="left">Product</th>
<th align="center">Qty</th>
<th align="right">Price</th>
</tr>

${items}

</table>

<hr>

<p>
<strong>Total:</strong>
Rs. ${order.finalAmount}
</p>

<p>
<strong>Payment:</strong>
${order.paymentMethod}
</p>

<p>
<strong>Status:</strong>
${order.orderStatus}
</p>

</td>
</tr>

<tr>
<td style="background:#f1f1f1;padding:20px;text-align:center;font-size:13px;color:#666;">
Thank you for shopping with FreshBite ❤️
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};

export default orderConfirmationEmail;