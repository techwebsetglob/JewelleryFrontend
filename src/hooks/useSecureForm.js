import { useState } from 'react'
import { sanitizeObject } from '../security/sanitize'

export const useSecureForm = (schema, onSubmit) => {
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData) => {
    setErrors({})

    // 1. Validate with Zod schema
    const result = schema.safeParse(formData)
    if (!result.success) {
      const fieldErrors = {}
      result.error.errors.forEach(e => {
        fieldErrors[e.path[0]] = e.message
      })
      setErrors(fieldErrors)
      return false
    }

    // 2. Sanitize all inputs before sending to API
    const cleanData = sanitizeObject(result.data)

    // 3. Submit
    setLoading(true)
    try {
      await onSubmit(cleanData)
      return true
    } catch (err) {
      setErrors({ _form: err.message })
      return false
    } finally {
      setLoading(false)
    }
  }

  return { handleSubmit, errors, setErrors, loading }
}
