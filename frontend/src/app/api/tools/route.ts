import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId || typeof userId !== 'string') {
      return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400 })
    }

    const FACTORY_URL = process.env.FACTORY_URL || 'http://204.12.168.160:8001'
    const FACTORY_TOKEN = process.env.FACTORY_TOKEN || 'coral-bearer-token-2024'

    const res = await fetch(`${FACTORY_URL}/auth/tools?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FACTORY_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    const text = await res.text()
    let data: any = null
    try { data = text ? JSON.parse(text) : null } catch { data = { raw: text } }

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to get tools', status: res.status, data }), { status: 502 })
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal error', message: err?.message || String(err) }), { status: 500 })
  }
}
