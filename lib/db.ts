import mysql from "mysql2/promise"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"

// Update the connection pool to use only environment variables without defaults
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Helper function to execute SQL queries
export async function query(sql: string, params: any[] = []) {
  const [results] = await pool.execute(sql, params)
  return results
}

// Function to verify admin credentials
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  try {
    const users = (await query("SELECT passwordHash FROM admin_users WHERE username = ?", [username])) as any[]

    if (users.length === 0) {
      return false
    }

    const user = users[0]
    // Compare the provided password with the stored hash
    return await bcrypt.compare(password, user.passwordHash)
  } catch (error) {
    console.error("Error verifying admin credentials:", error)
    return false
  }
}

// Function to increment view count
export async function incrementViewCount(): Promise<number> {
  try {
    await query("UPDATE view_counter SET count = count + 1 WHERE id = 1")
    const result = (await query("SELECT count FROM view_counter WHERE id = 1")) as any[]
    return result[0].count
  } catch (error) {
    console.error("Error incrementing view count:", error)
    return 0
  }
}

// Function to get current view count
export async function getViewCount(): Promise<number> {
  try {
    const result = (await query("SELECT count FROM view_counter WHERE id = 1")) as any[]
    return result[0].count
  } catch (error) {
    console.error("Error getting view count:", error)
    return 0
  }
}

// Function to add a subscriber
export async function addSubscriber(email: string): Promise<boolean> {
  try {
    await query("INSERT INTO subscribers (id, email) VALUES (?, ?)", [uuidv4(), email])
    return true
  } catch (error) {
    console.error("Error adding subscriber:", error)
    return false
  }
}

// Function to create an order
export async function createOrder(orderData: {
  customerName: string
  email: string
  phone: string
  city: string
  address: string
  total: number
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
}): Promise<string | null> {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // Generate order ID
    const orderId = `ORD-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`

    // Insert order
    await connection.execute(
      "INSERT INTO orders (id, customerName, email, phone, city, address, status, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        orderId,
        orderData.customerName,
        orderData.email,
        orderData.phone,
        orderData.city,
        orderData.address,
        "processing",
        orderData.total,
      ],
    )

    // Insert order items
    for (const item of orderData.items) {
      await connection.execute(
        "INSERT INTO order_items (id, orderId, productId, quantity, price) VALUES (?, ?, ?, ?, ?)",
        [uuidv4(), orderId, item.productId, item.quantity, item.price],
      )
    }

    await connection.commit()
    return orderId
  } catch (error) {
    await connection.rollback()
    console.error("Error creating order:", error)
    return null
  } finally {
    connection.release()
  }
}

// ADMIN DASHBOARD FUNCTIONS

// Function to get all subscribers
export async function getSubscribers(): Promise<any[]> {
  try {
    const subscribers = await query("SELECT * FROM subscribers ORDER BY createdAt DESC")
    return subscribers as any[]
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return []
  }
}

// Function to delete a subscriber
export async function deleteSubscriber(id: string): Promise<boolean> {
  try {
    await query("DELETE FROM subscribers WHERE id = ?", [id])
    return true
  } catch (error) {
    console.error("Error deleting subscriber:", error)
    return false
  }
}

// Function to get all orders
export async function getOrders(): Promise<any[]> {
  try {
    const orders = await query("SELECT * FROM orders ORDER BY createdAt DESC")
    return orders as any[]
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}

// Function to get order details
export async function getOrderDetails(orderId: string): Promise<any | null> {
  try {
    // Get order
    const orders = (await query("SELECT * FROM orders WHERE id = ?", [orderId])) as any[]

    if (orders.length === 0) {
      return null
    }

    const order = orders[0]

    // Get order items
    const items = await query(
      `
      SELECT oi.*, p.name as productName, p.image as productImage
      FROM order_items oi
      JOIN products p ON oi.productId = p.id
      WHERE oi.orderId = ?
    `,
      [orderId],
    )

    return {
      ...order,
      items,
    }
  } catch (error) {
    console.error("Error fetching order details:", error)
    return null
  }
}

// Function to update order status
export async function updateOrderStatus(orderId: string, status: "processing" | "completed"): Promise<boolean> {
  try {
    await query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId])
    return true
  } catch (error) {
    console.error("Error updating order status:", error)
    return false
  }
}

// Function to get dashboard stats
export async function getDashboardStats(): Promise<{
  totalProducts: number
  totalOrders: number
  totalSubscribers: number
  pageViews: number
  recentOrders: any[]
  recentSubscribers: any[]
}> {
  try {
    // Get counts
    const [productCount] = (await query("SELECT COUNT(*) as count FROM products")) as any[]
    const [orderCount] = (await query("SELECT COUNT(*) as count FROM orders")) as any[]
    const [subscriberCount] = (await query("SELECT COUNT(*) as count FROM subscribers")) as any[]
    const [viewCount] = (await query("SELECT count FROM view_counter WHERE id = 1")) as any[]

    // Get recent orders
    const recentOrders = await query(`
      SELECT * FROM orders
      ORDER BY createdAt DESC
      LIMIT 3
    `)

    // Get recent subscribers
    const recentSubscribers = await query(`
      SELECT * FROM subscribers
      ORDER BY createdAt DESC
      LIMIT 5
    `)

    return {
      totalProducts: productCount.count,
      totalOrders: orderCount.count,
      totalSubscribers: subscriberCount.count,
      pageViews: viewCount.count,
      recentOrders: recentOrders as any[],
      recentSubscribers: recentSubscribers as any[],
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalSubscribers: 0,
      pageViews: 0,
      recentOrders: [],
      recentSubscribers: [],
    }
  }
}

// Add these functions at the end of the file

// Function to create a new product
export async function createProduct(productData: {
  name: string
  slug: string
  price: number
  image: string
  description?: string
  fullDescription?: string
  translations?: {
    [lang: string]: {
      name?: string
      description?: string
      fullDescription?: string
    }
  }
}): Promise<string | null> {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // Generate product ID
    const productId = uuidv4()

    // Insert product
    await connection.execute(
      "INSERT INTO products (id, name, slug, price, image, description, fullDescription) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        productId,
        productData.name,
        productData.slug,
        productData.price,
        productData.image,
        productData.description || null,
        productData.fullDescription || null,
      ],
    )

    // Insert translations if provided
    if (productData.translations) {
      for (const [lang, translation] of Object.entries(productData.translations)) {
        if (translation.name || translation.description || translation.fullDescription) {
          await connection.execute(
            "INSERT INTO product_translations (id, productId, lang, name, description, fullDescription) VALUES (?, ?, ?, ?, ?, ?)",
            [
              uuidv4(),
              productId,
              lang,
              translation.name || null,
              translation.description || null,
              translation.fullDescription || null,
            ],
          )
        }
      }
    }

    await connection.commit()
    return productId
  } catch (error) {
    await connection.rollback()
    console.error("Error creating product:", error)
    return null
  } finally {
    connection.release()
  }
}

// Function to update a product
export async function updateProduct(
  productId: string,
  productData: {
    name?: string
    slug?: string
    price?: number
    image?: string
    description?: string
    fullDescription?: string
    translations?: {
      [lang: string]: {
        name?: string
        description?: string
        fullDescription?: string
      }
    }
  },
): Promise<boolean> {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // Build update query dynamically based on provided fields
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (productData.name !== undefined) {
      updateFields.push("name = ?")
      updateValues.push(productData.name)
    }

    if (productData.slug !== undefined) {
      updateFields.push("slug = ?")
      updateValues.push(productData.slug)
    }

    if (productData.price !== undefined) {
      updateFields.push("price = ?")
      updateValues.push(productData.price)
    }

    if (productData.image !== undefined) {
      updateFields.push("image = ?")
      updateValues.push(productData.image)
    }

    if (productData.description !== undefined) {
      updateFields.push("description = ?")
      updateValues.push(productData.description)
    }

    if (productData.fullDescription !== undefined) {
      updateFields.push("fullDescription = ?")
      updateValues.push(productData.fullDescription)
    }

    // Only update if there are fields to update
    if (updateFields.length > 0) {
      const updateQuery = `UPDATE products SET ${updateFields.join(", ")}, updatedAt = NOW() WHERE id = ?`
      await connection.execute(updateQuery, [...updateValues, productId])
    }

    // Update translations if provided
    if (productData.translations) {
      for (const [lang, translation] of Object.entries(productData.translations)) {
        // Check if translation exists
        const existingTranslations = await connection.execute(
          "SELECT id FROM product_translations WHERE productId = ? AND lang = ?",
          [productId, lang],
        )
        const existingTranslation = (existingTranslations as any)[0][0]

        if (existingTranslation) {
          // Update existing translation
          const translationUpdateFields: string[] = []
          const translationUpdateValues: any[] = []

          if (translation.name !== undefined) {
            translationUpdateFields.push("name = ?")
            translationUpdateValues.push(translation.name)
          }

          if (translation.description !== undefined) {
            translationUpdateFields.push("description = ?")
            translationUpdateValues.push(translation.description)
          }

          if (translation.fullDescription !== undefined) {
            translationUpdateFields.push("fullDescription = ?")
            translationUpdateValues.push(translation.fullDescription)
          }

          if (translationUpdateFields.length > 0) {
            const translationUpdateQuery = `UPDATE product_translations SET ${translationUpdateFields.join(
              ", ",
            )} WHERE id = ?`
            await connection.execute(translationUpdateQuery, [...translationUpdateValues, existingTranslation.id])
          }
        } else {
          // Insert new translation
          await connection.execute(
            "INSERT INTO product_translations (id, productId, lang, name, description, fullDescription) VALUES (?, ?, ?, ?, ?, ?)",
            [
              uuidv4(),
              productId,
              lang,
              translation.name || null,
              translation.description || null,
              translation.fullDescription || null,
            ],
          )
        }
      }
    }

    await connection.commit()
    return true
  } catch (error) {
    await connection.rollback()
    console.error("Error updating product:", error)
    return false
  } finally {
    connection.release()
  }
}

// Function to delete a product
export async function deleteProduct(productId: string): Promise<boolean> {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // Delete product translations
    await connection.execute("DELETE FROM product_translations WHERE productId = ?", [productId])

    // Delete product ingredients
    await connection.execute("DELETE FROM product_ingredients WHERE productId = ?", [productId])

    // Delete ingredient translations
    await connection.execute("DELETE FROM ingredient_translations WHERE productId = ?", [productId])

    // Delete product images
    await connection.execute("DELETE FROM product_images WHERE productId = ?", [productId])

    // Delete product
    await connection.execute("DELETE FROM products WHERE id = ?", [productId])

    await connection.commit()
    return true
  } catch (error) {
    await connection.rollback()
    console.error("Error deleting product:", error)
    return false
  } finally {
    connection.release()
  }
}

// Function to get a product by ID
export async function getProductById(productId: string): Promise<any | null> {
  try {
    // Get the product
    const products = (await query(
      `
      SELECT * FROM products
      WHERE id = ?
    `,
      [productId],
    )) as any[]

    if (products.length === 0) {
      return null
    }

    const product = products[0]

    // Get product images
    const images = (await query(
      `
      SELECT imageUrl FROM product_images
      WHERE productId = ?
      ORDER BY displayOrder ASC
    `,
      [productId],
    )) as any[]

    // Get product ingredients
    const ingredients = (await query(
      `
      SELECT ingredient FROM product_ingredients
      WHERE productId = ?
      ORDER BY displayOrder ASC
    `,
      [productId],
    )) as any[]

    // Get product translations
    const translations = (await query(
      `
      SELECT lang, name, description, fullDescription
      FROM product_translations
      WHERE productId = ?
    `,
      [productId],
    )) as any[]

    // Get ingredient translations
    const ingredientTranslations = (await query(
      `
      SELECT lang, ingredient, displayOrder
      FROM ingredient_translations
      WHERE productId = ?
      ORDER BY displayOrder ASC
    `,
      [productId],
    )) as any[]

    // Format translations into the expected structure
    const formattedTranslations: Record<string, any> = {}
    translations.forEach((translation) => {
      formattedTranslations[translation.lang] = {
        name: translation.name,
        description: translation.description,
        fullDescription: translation.fullDescription,
      }
    })

    // Add ingredient translations to the formatted translations
    Object.keys(formattedTranslations).forEach((lang) => {
      const langIngredients = ingredientTranslations
        .filter((t: any) => t.lang === lang)
        .map((t: any) => t.ingredient)
        .sort((a: any, b: any) => a.displayOrder - b.displayOrder)

      if (langIngredients.length > 0) {
        formattedTranslations[lang].ingredients = langIngredients
      }
    })

    // Return the product with all its details
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number.parseFloat(product.price),
      image: product.image,
      images: images.map((img) => img.imageUrl),
      description: product.description || "",
      fullDescription: product.fullDescription || "",
      ingredients: ingredients.map((ing) => ing.ingredient),
      translations: formattedTranslations,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  } catch (error) {
    console.error("Error fetching product by ID:", error)
    return null
  }
}

// Function to check if a slug is unique
export async function isSlugUnique(slug: string, excludeProductId?: string): Promise<boolean> {
  try {
    let query = "SELECT COUNT(*) as count FROM products WHERE slug = ?"
    const params: any[] = [slug]

    if (excludeProductId) {
      query += " AND id != ?"
      params.push(excludeProductId)
    }

    const result = (await pool.execute(query, params)) as any
    return result[0][0].count === 0
  } catch (error) {
    console.error("Error checking slug uniqueness:", error)
    return false
  }
}

// Function to add product images
export async function addProductImages(productId: string, imageUrls: string[]): Promise<boolean> {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // Get current max display order
    const orderResult = await connection.execute(
      "SELECT MAX(displayOrder) as maxOrder FROM product_images WHERE productId = ?",
      [productId],
    )
    const maxOrder = (orderResult as any)[0][0].maxOrder || -1

    // Insert images
    for (let i = 0; i < imageUrls.length; i++) {
      await connection.execute(
        "INSERT INTO product_images (id, productId, imageUrl, displayOrder) VALUES (?, ?, ?, ?)",
        [uuidv4(), productId, imageUrls[i], maxOrder + i + 1],
      )
    }

    await connection.commit()
    return true
  } catch (error) {
    await connection.rollback()
    console.error("Error adding product images:", error)
    return false
  } finally {
    connection.release()
  }
}

// Function to delete a product image
export async function deleteProductImage(productId: string, imageUrl: string): Promise<boolean> {
  try {
    await query("DELETE FROM product_images WHERE productId = ? AND imageUrl = ?", [productId, imageUrl])
    return true
  } catch (error) {
    console.error("Error deleting product image:", error)
    return false
  }
}

// Function to add product ingredients
export async function addProductIngredients(
  productId: string,
  ingredients: string[],
  translations?: { [lang: string]: string[] },
): Promise<boolean> {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // Delete existing ingredients
    await connection.execute("DELETE FROM product_ingredients WHERE productId = ?", [productId])
    await connection.execute("DELETE FROM ingredient_translations WHERE productId = ?", [productId])

    // Insert ingredients
    for (let i = 0; i < ingredients.length; i++) {
      await connection.execute(
        "INSERT INTO product_ingredients (id, productId, ingredient, displayOrder) VALUES (?, ?, ?, ?)",
        [uuidv4(), productId, ingredients[i], i],
      )
    }

    // Insert ingredient translations if provided
    if (translations) {
      for (const [lang, langIngredients] of Object.entries(translations)) {
        for (let i = 0; i < langIngredients.length; i++) {
          if (i < ingredients.length) {
            await connection.execute(
              "INSERT INTO ingredient_translations (id, productId, lang, ingredient, displayOrder) VALUES (?, ?, ?, ?, ?)",
              [uuidv4(), productId, lang, langIngredients[i], i],
            )
          }
        }
      }
    }

    await connection.commit()
    return true
  } catch (error) {
    await connection.rollback()
    console.error("Error adding product ingredients:", error)
    return false
  } finally {
    connection.release()
  }
}

// Function to handle image uploads
export async function uploadProductImage(file: File): Promise<string> {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "public", "uploads")
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  // Generate a unique filename
  const fileExtension = path.extname(file.name)
  const fileName = `${uuidv4()}${fileExtension}`
  const filePath = path.join(uploadsDir, fileName)

  // Read file buffer and write to disk
  const buffer = await file.arrayBuffer()
  fs.writeFileSync(filePath, Buffer.from(buffer))

  // Return the public URL path
  return `/uploads/${fileName}`
}
