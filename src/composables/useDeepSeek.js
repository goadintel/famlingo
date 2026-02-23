// DeepSeek AI Integration
// Handles: Translation, Pronunciation Scoring, Context Generation

import { ref } from 'vue'

export function useDeepSeek() {
  const loading = ref(false)
  const error = ref(null)

  // Get API key from localStorage
  function getApiKey() {
    return localStorage.getItem('famlingo_deepseek_api_key')
  }

  // Save API key
  function saveApiKey(key) {
    localStorage.setItem('famlingo_deepseek_api_key', key)
  }

  // Call DeepSeek API
  async function callDeepSeek(prompt, temperature = 0.7) {
    const apiKey = getApiKey()
    if (!apiKey) {
      throw new Error('DeepSeek API key not configured')
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional Chinese-English language tutor. Provide accurate translations, pronunciation guidance, and cultural context.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`DeepSeek API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  // Translate phrase (bidirectional)
  async function translatePhrase(text, direction = 'en-to-cn') {
    loading.value = true
    error.value = null

    try {
      const prompt = direction === 'en-to-cn'
        ? `Translate this English phrase to Chinese: "${text}"

Return a JSON object with this exact structure:
{
  "chinese": "Chinese translation",
  "pinyin": "Pinyin with tone marks",
  "literal": "Literal word-by-word translation",
  "context": "When to use this phrase (English)",
  "contextCN": "什么时候用这个短语（中文）",
  "formality": "formal/casual/neutral",
  "alternatives": [
    { "chinese": "Alternative 1", "pinyin": "pinyin", "note": "Usage note" },
    { "chinese": "Alternative 2", "pinyin": "pinyin", "note": "Usage note" }
  ]
}`
        : `Translate this Chinese phrase to English: "${text}"

Return a JSON object with this exact structure:
{
  "english": "English translation",
  "pinyin": "Pinyin with tone marks (if Chinese characters provided)",
  "literal": "Literal word-by-word translation",
  "context": "When to use this phrase",
  "contextCN": "什么时候用这个短语",
  "formality": "formal/casual/neutral",
  "alternatives": [
    { "english": "Alternative 1", "note": "Usage note" },
    { "english": "Alternative 2", "note": "Usage note" }
  ]
}`

      const result = await callDeepSeek(prompt, 0.5)

      // Parse JSON response
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI')
      }

      const translation = JSON.parse(jsonMatch[0])
      return translation

    } catch (err) {
      error.value = err.message
      console.error('Translation error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Score pronunciation (simulated - real implementation would use audio)
  async function scorePronunciation(text, userAnswer, expectedAnswer) {
    loading.value = true
    error.value = null

    try {
      const prompt = `You are a Chinese pronunciation tutor.

The phrase is: "${text}"
Expected pronunciation: "${expectedAnswer}"
User's attempt: "${userAnswer}"

Analyze the user's pronunciation attempt and provide:
1. Score out of 10
2. Specific feedback on what's good and what needs improvement
3. Tips for improvement

Return a JSON object:
{
  "score": 8.5,
  "feedback": "Detailed feedback here",
  "feedbackCN": "详细反馈（中文）",
  "goodPoints": ["What they did well"],
  "improvements": ["What needs work"],
  "tips": "Specific tips for improvement"
}`

      const result = await callDeepSeek(prompt, 0.3)

      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI')
      }

      const scoring = JSON.parse(jsonMatch[0])
      return scoring

    } catch (err) {
      error.value = err.message
      console.error('Pronunciation scoring error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Validate translation accuracy
  async function validateTranslation(source, translation, direction) {
    loading.value = true
    error.value = null

    try {
      const prompt = direction === 'en-to-cn'
        ? `Validate this translation:
English: "${source}"
Chinese: "${translation}"

Is this translation accurate? Return JSON:
{
  "isAccurate": true/false,
  "score": 0-10,
  "feedback": "Why it's correct or what's wrong",
  "betterTranslation": "Better translation if score < 8"
}`
        : `Validate this translation:
Chinese: "${source}"
English: "${translation}"

Is this translation accurate? Return JSON:
{
  "isAccurate": true/false,
  "score": 0-10,
  "feedback": "Why it's correct or what's wrong",
  "betterTranslation": "Better translation if score < 8"
}`

      const result = await callDeepSeek(prompt, 0.3)

      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI')
      }

      const validation = JSON.parse(jsonMatch[0])
      return validation

    } catch (err) {
      error.value = err.message
      console.error('Validation error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update a card from edited English text
  async function updateCardFromEnglish(englishText) {
    loading.value = true
    error.value = null

    try {
      const prompt = `Translate this English phrase to Chinese: "${englishText}"

Return a JSON object with this exact structure:
{
  "cn": "Chinese translation (characters)",
  "pinyin": "Pinyin with tone marks",
  "en": "${englishText}",
  "literalTranslation": "Literal word-by-word translation",
  "context": {
    "en": "When and how to use this phrase (English)",
    "cn": "什么时候以及怎么用这个短语（中文）"
  }
}`

      const result = await callDeepSeek(prompt, 0.3)

      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI')
      }

      return JSON.parse(jsonMatch[0])

    } catch (err) {
      error.value = err.message
      console.error('Card update error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Generate context for a phrase
  async function generateContext(phrase, language = 'both') {
    loading.value = true
    error.value = null

    try {
      const prompt = `Provide context for this phrase: "${phrase}"

Include:
- When to use it
- Formality level
- Cultural notes
- Common situations

Return JSON:
{
  "whenToUse": "When to use this phrase",
  "whenToUseCN": "什么时候用",
  "formality": "formal/casual/neutral",
  "culturalNotes": "Cultural context",
  "situations": ["Situation 1", "Situation 2", "Situation 3"]
}`

      const result = await callDeepSeek(prompt, 0.5)

      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI')
      }

      const context = JSON.parse(jsonMatch[0])
      return context

    } catch (err) {
      error.value = err.message
      console.error('Context generation error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getApiKey,
    saveApiKey,
    translatePhrase,
    updateCardFromEnglish,
    scorePronunciation,
    validateTranslation,
    generateContext
  }
}
