import {
    readBenefits
} from '../services/openai.js'

export async function getBenefits(req, res) {
    const { text } = req.body

    if (!text) {
        return res.status(400).json({ error: 'Text is required' })
    }

    try {
        const benefits = await readBenefits(text)
        return res.status(200).json({ benefits })
    } catch (error) {
        console.error('Error in getBenefits:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}

