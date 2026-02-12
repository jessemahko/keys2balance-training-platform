const nodemailer = require('nodemailer')

const sendEmail = async (to, subject, text) => {
	// 1. Create transporter (SMTP)
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	})

	// 2. Send mail
	await transporter.sendMail({
		from: `"Keys2Balance" <${process.env.SMTP_USER}>`,
		to,
		subject,
		text,
	})

	console.log(`Email sent to ${to}`)
}

module.exports = sendEmail

