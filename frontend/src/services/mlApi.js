const API_BASE_URL = 'http://localhost:5000'

export async function predictRisk(payload) {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Risk API failed (${response.status}): ${errorText}`,
    )
  }

  return response.json()
}

export async function checkApiHealth() {
  const response = await fetch(`${API_BASE_URL}/health`)

  if (!response.ok) {
    throw new Error('Risk API is unavailable')
  }

  return response.json()
}