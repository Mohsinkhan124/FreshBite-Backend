const welcomeEmail = (name) => {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Welcome</title>
</head>

<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;margin-top:40px;border-radius:10px;overflow:hidden;">

<tr>
<td style="background:#16a34a;padding:25px;text-align:center;color:#fff;font-size:28px;font-weight:bold;">
FreshBite 🍔
</td>
</tr>

<tr>
<td style="padding:40px;">

<h2>Hello ${name} 👋</h2>

<p>
Welcome to <strong>FreshBite</strong>.
</p>

<p>
Your account has been created successfully.
</p>

<p>
Thank you for joining us.
</p>

<a
href="https://freshbite-shop.vercel.app/"
style="
display:inline-block;
padding:12px 25px;
background:#16a34a;
color:white;
text-decoration:none;
border-radius:5px;
margin-top:20px;
"
>
Visit FreshBite
</a>

</td>
</tr>

<tr>
<td
style="
background:#f1f1f1;
padding:20px;
text-align:center;
font-size:13px;
color:#666;
"
>
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

export default welcomeEmail;