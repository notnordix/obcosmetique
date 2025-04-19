import nodemailer from "nodemailer"

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
})

// Email address to receive notifications
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "your-email@example.com"

// Function to send order notification email
export async function sendOrderNotification(orderData: {
  id: string
  customerName: string
  email: string
  phone: string
  city: string
  address: string
  total: number
  items: Array<{
    productName: string
    quantity: number
    price: number
  }>
}): Promise<boolean> {
  try {
    // Format items for email
    const itemsList = orderData.items
      .map((item) => `${item.quantity}x ${item.productName} - ${item.price.toFixed(2)} MAD each`)
      .join("\n")

    // Create email content
    const emailContent = `
      New Order Received!
      
      Order ID: ${orderData.id}
      Date: ${new Date().toLocaleString()}
      
      Customer Information:
      Name: ${orderData.customerName}
      Email: ${orderData.email}
      Phone: ${orderData.phone}
      City: ${orderData.city}
      Address: ${orderData.address}
      
      Order Items:
      ${itemsList}
      
      Total: ${orderData.total.toFixed(2)} MAD
      
      Please log in to the admin dashboard to process this order.
    `

    // Send email
    await transporter.sendMail({
      from: `"Ob Cosmétique" <${process.env.EMAIL_USER || "notifications@obcosmetique.com"}>`,
      to: NOTIFICATION_EMAIL,
      subject: `New Order #${orderData.id} - Ob Cosmétique`,
      text: emailContent,
      html: emailContent.replace(/\n/g, "<br>"),
    })

    return true
  } catch (error) {
    console.error("Error sending order notification email:", error)
    return false
  }
}
