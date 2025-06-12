const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...')

    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!')

    // Test user count using raw SQL
    const userCountResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`
    const userCount = Number(userCountResult[0].count)
    console.log(`📊 Users in database: ${userCount}`)

    // Test project count using raw SQL
    const projectCountResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM projects`
    const projectCount = Number(projectCountResult[0].count)
    console.log(`📊 Projects in database: ${projectCount}`)

    // List all users using raw SQL
    const users = await prisma.$queryRaw`SELECT id, name, email, "createdAt" FROM users LIMIT 10`
    console.log('👥 Users:', users)

    // Test table existence
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log('📋 Tables:', tables.map(t => t.table_name))

    console.log('🎉 Database test completed successfully!')

  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
