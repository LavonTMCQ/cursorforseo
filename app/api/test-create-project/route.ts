import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Direct API route called')
    
    const body = await request.json()
    console.log('🔍 Request body:', JSON.stringify(body, null, 2))
    console.log('🔍 Request body type:', typeof body)

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, domain } = body

    if (!name || !domain) {
      return NextResponse.json({ error: 'Name and domain are required' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name,
        domain,
        userId: session.user.id,
        settings: {},
      },
    })

    console.log('✅ Project created successfully:', project)
    return NextResponse.json(project)
  } catch (error) {
    console.error('❌ Error in direct API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
