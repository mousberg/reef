import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { workflowState, userId } = body || {}

    if (!workflowState || typeof workflowState !== 'object') {
      return new Response(JSON.stringify({ error: 'workflowState is required' }), { status: 400 })
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400 })
    }

    const FACTORY_URL = process.env.FACTORY_URL || 'http://204.12.168.160:8001'
    const FACTORY_TOKEN = process.env.FACTORY_TOKEN || 'coral-bearer-token-2024'

    // Transform if needed: backend expects { main_task, relations, agents: [...] }
    // If UI stored agents as a map, convert to array. Otherwise pass-through.
    const agentsArray = Array.isArray(workflowState.agents)
      ? workflowState.agents
      : Object.values(workflowState.agents || {})

    const payload = {
      main_task: workflowState.main_task,
      relations: workflowState.relations,
      agents: agentsArray,
    }

    const res = await fetch(`${FACTORY_URL}/create/workflow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FACTORY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const text = await res.text()
    let data: any = null
    try { data = text ? JSON.parse(text) : null } catch { data = { raw: text } }

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Factory export failed', status: res.status, data }), { status: 502 })
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal error', message: err?.message || String(err) }), { status: 500 })
  }
}
