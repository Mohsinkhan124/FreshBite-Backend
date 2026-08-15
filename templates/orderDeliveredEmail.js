const orderDeliveredEmail = (order) => {
    const items = order.items
        .map(
            (item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;">
          ${item.name}
        </td>

        <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">
          ${item.quantity}
        </td>

        <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">
          Rs. ${item.price}
        </td>

        <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">
         <a
  href="http://localhost:3000/reviews/write/${item.product}"
  style="background:#16a34a;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px;display:inline-block;"
>
  ⭐ Review
</a>
        </td>
      </tr>
    `,
        )
        .join("");

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Order Delivered</title>
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

<h2>Order Delivered 🎉</h2>

<p>
Your FreshBite order has been successfully delivered.
</p>

<p>
<strong>Order Number:</strong>
${order.orderNumber}
</p>

<p>
We'd love to hear about your experience. ❤️
Please leave a review for the products you purchased.
</p>

<table width="100%" cellspacing="0" cellpadding="0">

<tr>
<th align="left">Product</th>
<th align="center">Qty</th>
<th align="right">Price</th>
<th align="center">Review</th>
</tr>

${items}

</table>

<p style="margin-top:30px;">
Thank you for shopping with FreshBite!
</p>

</td>
</tr>

<tr>
<td style="background:#f1f1f1;padding:20px;text-align:center;font-size:13px;color:#666;">
Thank you for choosing FreshBite ❤️
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

export default orderDeliveredEmail;