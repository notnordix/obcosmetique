"use server"

import mysql from "mysql2/promise"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"
import type { Product } from "./types"
import {
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  getSubscribers,
  deleteSubscriber,
  getDashboardStats,
} from "./db"

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

// Function to verify admin credentials
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  try {
    const users = (await query("SELECT passwordHash FROM admin_users WHERE username = ?", [username])) as any[]

    if (users.length === 0) {
      return false
    }

    const user = users[0]
    // Use bcryptjs instead of bcrypt for better compatibility
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

// Function to get all products with their translations, images, and ingredients
export async function getProducts(lang?: string): Promise<Product[]> {
  try {
    // Get all products
    const products = (await query(`
      SELECT * FROM products
      ORDER BY createdAt DESC
    `)) as any[]

    // For each product, get its translations, images, and ingredients
    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        // Get product images
        const images = (await query(
          `
          SELECT imageUrl FROM product_images
          WHERE productId = ?
          ORDER BY displayOrder ASC
        `,
          [product.id],
        )) as any[]

        // Get product ingredients
        const ingredients = (await query(
          `
          SELECT ingredient FROM product_ingredients
          WHERE productId = ?
          ORDER BY displayOrder ASC
        `,
          [product.id],
        )) as any[]

        // Get product translations
        const translations = (await query(
          `
          SELECT lang, name, description, fullDescription
          FROM product_translations
          WHERE productId = ?
        `,
          [product.id],
        )) as any[]

        // Get ingredient translations
        const ingredientTranslations = (await query(
          `
          SELECT lang, ingredient, displayOrder
          FROM ingredient_translations
          WHERE productId = ?
          ORDER BY displayOrder ASC
        `,
          [product.id],
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
        } as Product
      }),
    )

    return productsWithDetails
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

// Function to get a single product by slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    // Get the product
    const products = (await query(
      `
      SELECT * FROM products
      WHERE slug = ?
    `,
      [slug],
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
      [product.id],
    )) as any[]

    // Get product ingredients
    const ingredients = (await query(
      `
      SELECT ingredient FROM product_ingredients
      WHERE productId = ?
      ORDER BY displayOrder ASC
    `,
      [product.id],
    )) as any[]

    // Get product translations
    const translations = (await query(
      `
      SELECT lang, name, description, fullDescription
      FROM product_translations
      WHERE productId = ?
    `,
      [product.id],
    )) as any[]

    // Get ingredient translations
    const ingredientTranslations = (await query(
      `
      SELECT lang, ingredient, displayOrder
      FROM ingredient_translations
      WHERE productId = ?
      ORDER BY displayOrder ASC
    `,
      [product.id],
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

    // Extract all image URLs from the images array
    const imageUrls = images.map((img) => img.imageUrl)

    // Return the product with all its details
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number.parseFloat(product.price),
      image: product.image,
      images: imageUrls, // Use all images from the database
      description: product.description || "",
      fullDescription: product.fullDescription || "",
      ingredients: ingredients.map((ing) => ing.ingredient),
      translations: formattedTranslations,
    } as Product
  } catch (error) {
    console.error("Error fetching product by slug:", error)
    return null
  }
}

// Function to get related products (excluding the current product)
export async function getRelatedProducts(currentProductId: string, limit = 4): Promise<Product[]> {
  try {
    // Get products excluding the current one
    const products = (await query(
      `
      SELECT * FROM products
      WHERE id != ?
      ORDER BY RAND()
      LIMIT ?
    `,
      [currentProductId, limit],
    )) as any[]

    // For each product, get its translations and image
    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        // Get product translations
        const translations = (await query(
          `
          SELECT lang, name, description
          FROM product_translations
          WHERE productId = ?
        `,
          [product.id],
        )) as any[]

        // Format translations into the expected structure
        const formattedTranslations: Record<string, any> = {}
        translations.forEach((translation) => {
          formattedTranslations[translation.lang] = {
            name: translation.name,
            description: translation.description,
          }
        })

        // Return the product with basic details needed for product cards
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number.parseFloat(product.price),
          image: product.image,
          description: product.description || "",
          translations: formattedTranslations,
        } as Product
      }),
    )

    return productsWithDetails
  } catch (error) {
    console.error("Error fetching related products:", error)
    return []
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

// Re-export the functions we need for server components and API routes
export { getOrders, getOrderDetails, updateOrderStatus, getSubscribers, deleteSubscriber, getDashboardStats }

// Add these functions at the end of the file

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

// Function to create a product with all its related data
export async function createProduct(productData: any): Promise<string | null> {
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
        productData.description || "",
        productData.fullDescription || "",
      ],
    )

    // Insert main image as first product image
    await connection.execute("INSERT INTO product_images (id, productId, imageUrl, displayOrder) VALUES (?, ?, ?, ?)", [
      uuidv4(),
      productId,
      productData.image,
      0,
    ])

    // Insert additional images if provided
    if (productData.additionalImages && productData.additionalImages.length > 0) {
      for (let i = 0; i < productData.additionalImages.length; i++) {
        await connection.execute(
          "INSERT INTO product_images (id, productId, imageUrl, displayOrder) VALUES (?, ?, ?, ?)",
          [uuidv4(), productId, productData.additionalImages[i], i + 1],
        )
      }
    }

    // Insert ingredients if provided
    if (productData.ingredients && productData.ingredients.length > 0) {
      for (let i = 0; i < productData.ingredients.length; i++) {
        await connection.execute(
          "INSERT INTO product_ingredients (id, productId, ingredient, displayOrder) VALUES (?, ?, ?, ?)",
          [uuidv4(), productId, productData.ingredients[i], i],
        )
      }
    }

    // Insert translations if provided
    if (productData.translations) {
      // Process each language
      for (const lang of Object.keys(productData.translations)) {
        const translation = productData.translations[lang]

        // Insert product translation
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

        // Insert ingredient translations if provided
        if (translation.ingredients && translation.ingredients.length > 0) {
          for (let i = 0; i < translation.ingredients.length; i++) {
            await connection.execute(
              "INSERT INTO ingredient_translations (id, productId, lang, ingredient, displayOrder) VALUES (?, ?, ?, ?, ?)",
              [uuidv4(), productId, lang, translation.ingredients[i], i],
            )
          }
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

// Function to update a product with all its related data
export async function updateProduct(productId: string, productData: any): Promise<boolean> {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // Update product basic info
    const updateFields = []
    const updateValues = []

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

    if (updateFields.length > 0) {
      const updateQuery = `UPDATE products SET ${updateFields.join(", ")} WHERE id = ?`
      updateValues.push(productId)
      await connection.execute(updateQuery, updateValues)
    }

    // Handle product images
    if (productData.image !== undefined || productData.additionalImages !== undefined) {
      // Delete existing images
      await connection.execute("DELETE FROM product_images WHERE productId = ?", [productId])

      // Insert main image as first product image
      if (productData.image) {
        await connection.execute(
          "INSERT INTO product_images (id, productId, imageUrl, displayOrder) VALUES (?, ?, ?, ?)",
          [uuidv4(), productId, productData.image, 0],
        )
      }

      // Insert additional images
      if (productData.additionalImages && productData.additionalImages.length > 0) {
        for (let i = 0; i < productData.additionalImages.length; i++) {
          await connection.execute(
            "INSERT INTO product_images (id, productId, imageUrl, displayOrder) VALUES (?, ?, ?, ?)",
            [uuidv4(), productId, productData.additionalImages[i], i + 1],
          )
        }
      }
    }

    // Handle ingredients
    if (productData.ingredients !== undefined) {
      // Delete existing ingredients
      await connection.execute("DELETE FROM product_ingredients WHERE productId = ?", [productId])

      // Insert new ingredients
      if (productData.ingredients && productData.ingredients.length > 0) {
        for (let i = 0; i < productData.ingredients.length; i++) {
          await connection.execute(
            "INSERT INTO product_ingredients (id, productId, ingredient, displayOrder) VALUES (?, ?, ?, ?)",
            [uuidv4(), productId, productData.ingredients[i], i],
          )
        }
      }
    }

    // Handle translations
    if (productData.translations) {
      // Process each language
      for (const lang of Object.keys(productData.translations)) {
        const translation = productData.translations[lang]

        // Check if translation exists
        const existingTranslations = await connection.execute(
          "SELECT id FROM product_translations WHERE productId = ? AND lang = ?",
          [productId, lang],
        )

        if ((existingTranslations[0] as any[]).length > 0) {
          // Update existing translation
          const translationId = (existingTranslations[0] as any[])[0].id

          const translationUpdateFields = []
          const translationUpdateValues = []

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
            const translationUpdateQuery = `UPDATE product_translations SET ${translationUpdateFields.join(", ")} WHERE id = ?`
            translationUpdateValues.push(translationId)
            await connection.execute(translationUpdateQuery, translationUpdateValues)
          }
        } else if (translation.name || translation.description || translation.fullDescription) {
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

        // Handle ingredient translations
        if (translation.ingredients !== undefined) {
          // Delete existing ingredient translations for this language
          await connection.execute("DELETE FROM ingredient_translations WHERE productId = ? AND lang = ?", [
            productId,
            lang,
          ])

          // Insert new ingredient translations
          if (translation.ingredients && translation.ingredients.length > 0) {
            for (let i = 0; i < translation.ingredients.length; i++) {
              await connection.execute(
                "INSERT INTO ingredient_translations (id, productId, lang, ingredient, displayOrder) VALUES (?, ?, ?, ?, ?)",
                [uuidv4(), productId, lang, translation.ingredients[i], i],
              )
            }
          }
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
