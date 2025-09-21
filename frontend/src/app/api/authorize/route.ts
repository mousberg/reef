import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, toolName } = body || {}

    if (!userId || typeof userId !== 'string') {
      return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400 })
    }

    if (!toolName || typeof toolName !== 'string') {
      return new Response(JSON.stringify({ error: 'toolName is required' }), { status: 400 })
    }

    const FACTORY_URL = process.env.FACTORY_URL || 'http://204.12.168.160:8001'
    const FACTORY_TOKEN = process.env.FACTORY_TOKEN || 'coral-bearer-token-2024'

    const res = await fetch(`${FACTORY_URL}/auth/authorize/${userId}/${toolName}`, {
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
      return new Response(JSON.stringify({ error: 'Authorization failed', status: res.status, data }), { status: 502 })
    }

    // Check if user is already authenticated or needs to authenticate via URL
    if (data.authenticated === true) {
      // Already authenticated
      return new Response(JSON.stringify({ 
        success: true, 
        authenticated: true, 
        message: 'Already authenticated' 
      }), { status: 200 })
    } else if (data.authenticated === false && data.url) {
      // Need to redirect to OAuth URL
      return new Response(JSON.stringify({ 
        success: true, 
        authenticated: false, 
        authUrl: data.url,
        message: 'Redirect to OAuth URL required' 
      }), { status: 200 })
    } else {
      // Unexpected response
      return new Response(JSON.stringify({ error: 'Unexpected response format', data }), { status: 502 })
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal error', message: err?.message || String(err) }), { status: 500 })
  }
}
