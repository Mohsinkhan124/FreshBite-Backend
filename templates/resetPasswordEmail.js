const resetPasswordEmail = (name, resetLink) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Reset Password</title>
</head>

<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="600" style="background:#ffffff;margin-top:40px;border-radius:10px;overflow:hidden;">

<tr>
<td style="background:#16a34a;color:#ffffff;padding:25px;text-align:center;font-size:28px;font-weight:bold;">
FreshBite 🍔
</td>
</tr>

<tr>
<td style="padding:35px;">

<h2>Hello ${name} 👋</h2>

<p>
We received a request to reset your password.
</p>

<p>
Click the button below to create a new password.
</p>

<a
href="${resetLink}"
style="
display:inline-block;
padding:12px 25px;
background:#16a34a;
color:#ffffff;
text-decoration:none;
border-radius:5px;
margin-top:20px;
"
>
Reset Password
</a>

<p style="margin-top:30px;color:#666;">
This link will expire in 30 minutes.
</p>

<p style="color:#666;">
If you didn't request this, you can safely ignore this email.
</p>

</td>
</tr>

<tr>
<td style="background:#f1f1f1;padding:20px;text-align:center;font-size:13px;color:#666;">
© 2026 FreshBite. All Rights Reserved.
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

export default resetPasswordEmail;