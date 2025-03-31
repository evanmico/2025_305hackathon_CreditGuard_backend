import {
    readBenefitsFromLink,
    readBenefitsFromLinkFirecrawl
} from '../services/openai.js'
import {
    storeCard,
    storeBenefits,
    competitorCardBenefits
}from '../services/database.js'

export async function getBenefits(req, res) {
    try {
        const { bankName, cardName, link } = req.body

        if(!bankName){
            return res.status(400).json({ error: 'Bank name is required' })
        }
        if(!cardName){
            return res.status(400).json({ error: 'Card name is required' })
        }
        if(!link){
            return res.status(400).json({ error: 'Link is required' })
        }


        const benefits = await readBenefitsFromLinkFirecrawl(link)

        if(!benefits || benefits.length === 0){
            return res.status(404).json({ error: 'No benefits found' })
        }

        let storeCardResponse = await storeCard(bankName, cardName)
        if(!storeCardResponse || !storeCardResponse.bankInfo || !storeCardResponse.cardInfo){
            throw error('Error storing card:', storeCardResponse)
        }
        let storeBenefitsResponse;

        try{

            storeBenefitsResponse = await storeBenefits(storeCardResponse.cardInfo.ID, benefits)
            if(!storeBenefitsResponse || !storeBenefitsResponse.card_benefit || !storeBenefitsResponse.full$benefit){
                throw error('WARNING: Error storing benefits:', storeBenefitsResponse)
            }

        }catch(error){
            console.error('Error storing card or benefits:', error)
            
        }

        const competitorBenefits = await competitorCardBenefits(storeCardResponse.cardInfo.ID)

        if(!competitorBenefits || competitorBenefits.length === 0){
            return res.status(404).json({ error: 'No competitor benefits found' })
        }

        return res.status(200).json({ benefits: benefits , competitorCards: competitorBenefits})
    } catch (error) {
        console.error('Error in getBenefits:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}

