const { Pool } = require('pg');
const crypto = require('crypto');

// Database connection using environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    "postgresql://neondb_owner:npg_bKZoVXhMa8w5@ep-wild-firefly-aetjevra-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

// Password hashing function
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "salt123")
    .digest("hex");
}

// Sample data with high-quality images
const sampleUsers = [
  {
    first_name: 'Admin',
    last_name: 'User', 
    phone: '+254712345678',
    email: 'admin@zuasoko.com',
    password: 'password123',
    role: 'ADMIN',
    county: 'Nairobi',
    verified: true,
    registration_fee_paid: true
  },
  {
    first_name: 'John',
    last_name: 'Kamau',
    phone: '+254723456789', 
    email: 'john.kamau@farmer.com',
    password: 'farmer123',
    role: 'FARMER',
    county: 'Nakuru',
    verified: true,
    registration_fee_paid: true
  },
  {
    first_name: 'Mary',
    last_name: 'Wanjiku',
    phone: '+254734567890',
    email: 'mary.wanjiku@farmer.com', 
    password: 'farmer123',
    role: 'FARMER',
    county: 'Meru',
    verified: true,
    registration_fee_paid: true
  },
  {
    first_name: 'Peter',
    last_name: 'Mwangi',
    phone: '+254745678901',
    email: 'peter.mwangi@farmer.com',
    password: 'farmer123', 
    role: 'FARMER',
    county: 'Nyeri',
    verified: true,
    registration_fee_paid: true
  },
  {
    first_name: 'Jane',
    last_name: 'Njoki',
    phone: '+254756789012',
    email: 'jane.njoki@farmer.com',
    password: 'farmer123',
    role: 'FARMER', 
    county: 'Kiambu',
    verified: true,
    registration_fee_paid: true
  },
  {
    first_name: 'Customer',
    last_name: 'Demo',
    phone: '+254767890123',
    email: 'customer@demo.com',
    password: 'customer123',
    role: 'CUSTOMER',
    county: 'Nairobi', 
    verified: true,
    registration_fee_paid: true
  }
];

const sampleProducts = [
  {
    name: 'Fresh Red Tomatoes',
    category: 'Vegetables',
    price_per_unit: 120,
    unit: 'kg',
    description: 'Premium organic red tomatoes, vine-ripened and perfect for cooking. Rich in lycopene and vitamin C. Grown using sustainable farming practices.',
    stock_quantity: 150,
    is_featured: true,
    is_active: true,
    farmer_name: 'John Kamau',
    farmer_county: 'Nakuru',
    images: [
      'https://images.unsplash.com/photo-1546470427-e212b9d56085?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&h=400&fit=crop'
    ]
  },
  {
    name: 'Sweet Orange Potatoes',
    category: 'Root Vegetables', 
    price_per_unit: 85,
    unit: 'kg',
    description: 'Nutritious orange-fleshed sweet potatoes, high in beta-carotene and fiber. Perfect for roasting, baking, or making fries.',
    stock_quantity: 200,
    is_featured: true,
    is_active: true,
    farmer_name: 'Mary Wanjiku',
    farmer_county: 'Meru',
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&h=400&fit=crop'
    ]
  },
  {
    name: 'Fresh Baby Spinach',
    category: 'Leafy Greens',
    price_per_unit: 180,
    unit: 'kg',
    description: 'Tender baby spinach leaves, perfect for salads and smoothies. Packed with iron, vitamins A and K. Pesticide-free and locally grown.',
    stock_quantity: 80,
    is_featured: false,
    is_active: true,
    farmer_name: 'Peter Mwangi',
    farmer_county: 'Nyeri',
    images: [
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500&h=400&fit=crop'
    ]
  },
  {
    name: 'Organic Carrots',
    category: 'Root Vegetables',
    price_per_unit: 95,
    unit: 'kg', 
    description: 'Crisp and sweet organic carrots, perfect for snacking, juicing, or cooking. High in beta-carotene and antioxidants.',
    stock_quantity: 120,
    is_featured: false,
    is_active: true,
    farmer_name: 'Jane Njoki',
    farmer_county: 'Kiambu',
    images: [
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=500&h=400&fit=crop'
    ]
  },
  {
    name: 'Green Cabbage',
    category: 'Leafy Greens',
    price_per_unit: 60,
    unit: 'piece',
    description: 'Fresh green cabbage heads, perfect for coleslaw, stir-fries, and soups. Rich in vitamin C and fiber. Locally grown and chemical-free.',
    stock_quantity: 90,
    is_featured: true,
    is_active: true,
    farmer_name: 'John Kamau', 
    farmer_county: 'Nakuru',
    images: [
      'https://images.unsplash.com/photo-1594282486170-8c6c5b25cffe?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1553671278-e8a2d7af4392?w=500&h=400&fit=crop'
    ]
  },
  {
    name: 'Bell Peppers Mix',
    category: 'Vegetables',
    price_per_unit: 220,
    unit: 'kg',
    description: 'Colorful mix of red, yellow, and green bell peppers. Sweet and crunchy, perfect for salads, grilling, or stuffing. High in vitamin C.',
    stock_quantity: 75,
    is_featured: false,
    is_active: true,
    farmer_name: 'Mary Wanjiku',
    farmer_county: 'Meru',
    images: [
      'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1601544042509-77739bb8f8a7?w=500&h=400&fit=crop'
    ]
  },
  {
    name: 'Red Onions',
    category: 'Vegetables',
    price_per_unit: 70,
    unit: 'kg',
    description: 'Premium red onions with strong flavor and long shelf life. Essential for cooking and rich in antioxidants. Locally sourced from highland farms.',
    stock_quantity: 180,
    is_featured: false,
    is_active: true,
    farmer_name: 'Peter Mwangi',
    farmer_county: 'Nyeri',
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1508747703725-719777637510?w=500&h=400&fit=crop'
    ]
  },
  {
    name: 'Purple Eggplant',
    category: 'Vegetables',
    price_per_unit: 130,
    unit: 'kg',
    description: 'Fresh purple eggplants, perfect for grilling, roasting, or making traditional dishes. Rich in fiber and antioxidants.',
    stock_quantity: 65,
    is_featured: false,
    is_active: true,
    farmer_name: 'Jane Njoki',
    farmer_county: 'Kiambu',
    images: [
      'https://images.unsplash.com/photo-1606140622512-7bd81fb4aa2a?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1615485925600-97237c4fc1da?w=500&h=400&fit=crop'
    ]
  },
  {
    name: 'Fresh Kale',
    category: 'Leafy Greens',
    price_per_unit: 150,
    unit: 'kg',
    description: 'Nutrient-dense curly kale, perfect for smoothies, salads, and healthy cooking. Superfood packed with vitamins and minerals.',
    stock_quantity: 100,
    is_featured: true,
    is_active: true,
    farmer_name: 'Mary Wanjiku',
    farmer_county: 'Meru',
    images: [
      'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&h=400&fit=crop'
    ]
  },
  {
    name: 'White Potatoes',
    category: 'Root Vegetables',
    price_per_unit: 55,
    unit: 'kg',
    description: 'Versatile white potatoes, perfect for mashing, frying, or boiling. Good source of potassium and vitamin C. Bulk pricing available.',
    stock_quantity: 300,
    is_featured: false,
    is_active: true,
    farmer_name: 'John Kamau',
    farmer_county: 'Nakuru',
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1602248079016-7c8bf0c1246c?w=500&h=400&fit=crop'
    ]
  },
  {
    name: 'Green Beans',
    category: 'Vegetables',
    price_per_unit: 160,
    unit: 'kg',
    description: 'Tender green beans, crisp and flavorful. Perfect for steaming, stir-frying, or adding to casseroles. Rich in vitamins and fiber.',
    stock_quantity: 85,
    is_featured: false,
    is_active: true,
    farmer_name: 'Peter Mwangi',
    farmer_county: 'Nyeri',
    images: [
      'https://images.unsplash.com/photo-1553671278-e8a2d7af4392?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1630944241068-0ad3a1f68a06?w=500&h=400&fit=crop'
    ]
  },
  {
    name: 'Yellow Bananas',
    category: 'Fruits',
    price_per_unit: 80,
    unit: 'kg',
    description: 'Sweet ripe bananas, perfect for snacking or baking. Rich in potassium and natural sugars. Locally grown in highland regions.',
    stock_quantity: 250,
    is_featured: true,
    is_active: true,
    farmer_name: 'Jane Njoki',
    farmer_county: 'Kiambu',
    images: [
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&h=400&fit=crop'
    ]
  }
];

// Create tables
const createTables = async () => {
  console.log('🏗️ Creating database tables...');
  
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'CUSTOMER',
      county VARCHAR(100),
      verified BOOLEAN DEFAULT false,
      registration_fee_paid BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Products table with enhanced image support
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      price_per_unit DECIMAL(10,2) NOT NULL,
      unit VARCHAR(20) NOT NULL,
      description TEXT,
      stock_quantity INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      farmer_name VARCHAR(255),
      farmer_county VARCHAR(100),
      images JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Categories table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Counties table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS counties (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Orders table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(50) PRIMARY KEY,
      order_number VARCHAR(20) UNIQUE NOT NULL,
      customer_info JSONB NOT NULL,
      items JSONB NOT NULL,
      payment_method VARCHAR(20) NOT NULL,
      delivery_fee DECIMAL(10,2) DEFAULT 0,
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      payment_status VARCHAR(20) DEFAULT 'pending',
      delivery_status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('✅ Database tables created successfully');
};

// Seed users
const seedUsers = async () => {
  console.log('👥 Seeding users...');
  
  for (const user of sampleUsers) {
    try {
      const hashedPassword = hashPassword(user.password);
      
      await pool.query(`
        INSERT INTO users (first_name, last_name, phone, email, password_hash, role, county, verified, registration_fee_paid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (phone) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email = EXCLUDED.email,
          password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          county = EXCLUDED.county,
          verified = EXCLUDED.verified,
          registration_fee_paid = EXCLUDED.registration_fee_paid,
          updated_at = NOW()
      `, [
        user.first_name, user.last_name, user.phone, user.email,
        hashedPassword, user.role, user.county, user.verified, user.registration_fee_paid
      ]);
      
      console.log(`✅ User ${user.first_name} ${user.last_name} (${user.role}) seeded`);
    } catch (error) {
      console.error(`❌ Error seeding user ${user.first_name}:`, error.message);
    }
  }
};

// Seed products
const seedProducts = async () => {
  console.log('🛒 Seeding products...');
  
  for (const product of sampleProducts) {
    try {
      await pool.query(`
        INSERT INTO products (name, category, price_per_unit, unit, description, stock_quantity, is_featured, is_active, farmer_name, farmer_county, images)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (name) DO UPDATE SET
          category = EXCLUDED.category,
          price_per_unit = EXCLUDED.price_per_unit,
          unit = EXCLUDED.unit,
          description = EXCLUDED.description,
          stock_quantity = EXCLUDED.stock_quantity,
          is_featured = EXCLUDED.is_featured,
          is_active = EXCLUDED.is_active,
          farmer_name = EXCLUDED.farmer_name,
          farmer_county = EXCLUDED.farmer_county,
          images = EXCLUDED.images,
          updated_at = NOW()
      `, [
        product.name, product.category, product.price_per_unit, product.unit,
        product.description, product.stock_quantity, product.is_featured,
        product.is_active, product.farmer_name, product.farmer_county,
        JSON.stringify(product.images)
      ]);
      
      console.log(`✅ Product ${product.name} seeded`);
    } catch (error) {
      console.error(`❌ Error seeding product ${product.name}:`, error.message);
    }
  }
};

// Seed categories and counties
const seedMetadata = async () => {
  console.log('🏷️ Seeding categories and counties...');
  
  const categories = ['Vegetables', 'Root Vegetables', 'Leafy Greens', 'Fruits'];
  const counties = ['Nairobi', 'Nakuru', 'Meru', 'Nyeri', 'Kiambu', 'Kisumu', 'Mombasa', 'Eldoret', 'Thika'];
  
  for (const category of categories) {
    await pool.query(`
      INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING
    `, [category]);
  }
  
  for (const county of counties) {
    await pool.query(`
      INSERT INTO counties (name) VALUES ($1) ON CONFLICT (name) DO NOTHING  
    `, [county]);
  }
  
  console.log('✅ Categories and counties seeded');
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    console.log('🔗 Database URL:', process.env.DATABASE_URL ? '[SET FROM ENV]' : '[USING DEFAULT]');
    
    // Test connection
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected at:', testResult.rows[0].current_time);
    
    await createTables();
    await seedUsers();
    await seedProducts();
    await seedMetadata();
    
    // Show summary
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const productCount = await pool.query('SELECT COUNT(*) FROM products WHERE is_active = true');
    const featuredCount = await pool.query('SELECT COUNT(*) FROM products WHERE is_featured = true AND is_active = true');
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('='.repeat(50));
    console.log(`👥 Total Users: ${userCount.rows[0].count}`);
    console.log(`🛒 Active Products: ${productCount.rows[0].count}`); 
    console.log(`⭐ Featured Products: ${featuredCount.rows[0].count}`);
    console.log('='.repeat(50));
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: +254712345678 / password123');
    console.log('Farmer: +254723456789 / farmer123'); 
    console.log('Customer: +254767890123 / customer123');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await pool.end();
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
