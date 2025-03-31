import openai from 'openai';
import URL from 'url';


const openaiClient = new openai.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const benefits = []


export async function readBenefitsFromLink(link) {
    try{

        const benefitsURL = new URL(link)

        if(!benefitsURL.protocol || !benefitsURL.host){
            throw new Error('Invalid URL')
        }

        const response = await openaiClient.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an AI that will go through this link that will contain the benefits of a credit card. Go through 
                    the website and find all the benefits that the credit card offers if they were to sign up. Start with a dedicated benefits section,
                    then continue with the rest of the text to any hidden ones. Do not crawl through links unless the URL explicity states "benefits" within it's parameters.
                    An example of a URL you can crawl is "https://www.wellsfargo.com/credit-cards/autograph-visa/guide-to-benefits/#BTT" because this URL has the parameters "guide-to-benefits"
                    An example of a benefit you may find is "payment for standard towing up to 5 miles" or "We pay for your cellphone replacement incase you lose your cellphone".
                    Not all credit cards will offer the same benefits, so go throughly through each section to each benefit.
                    Return this information as an array of JSON objects, each JSON Object is formatted in this template:
                     [
                        {
                        benefitName: small str value,
                        benefitDescription: long text of full benefit detail
                        },
                        {
                        benefitName: small str value,
                        benefitDescription: long text of full benefit detail
                        },
                        {
                        benefitName: small str value,
                        benefitDescription: long text of full benefit detail
                        }
                    ],
                    Here is an example of a JSON object:
                    benefits:[
                        {
                            "Benefit Name": "Free Towing",
                            "description": "Free towing up to 5 miles. Your car must be fully unoperational and you must be within 5 miles of a towing service."
                        },
                        {
                            "benefit": "Cellphone protection",
                            "description": "If you lose your cellphone, we will pay for it's replacement."
                        }
                    ]
                    `,

                    role: 'user',
                    content: `${benefitsURL} \nThis link has information regarding the benefits of a credit card. Read it, and summarize the benefits of the product in it.`,

                    role: 'assistant',
                    content: `Return only an array of benefits in a json structure: Benefits[{Benefit name: description}]. 
                    Do not include any other text like an explanation or a presentation speech
                    If there is no benefits, return an empty array.`

                }
            ],
        })

        if(!response.choices || response.choices.length === 0){
            throw new Error('No choices found in the response')
        }

        const message = response.choices[0].message.content
        return message
    }catch(err){
        console.error('Error reading benefits:', err)
        throw err
    }
}

/*

FOR LATER DEVELOPMENT IF WE HAVE TIME

export async function readBenefitsFromFile(file) {
    try{

        const benefitsURL = new URL(link)

        if(!benefitsURL.protocol || !benefitsURL.host){
            throw new Error('Invalid URL')
        }

        const response = await openaiClient.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are an AI that will go through this link that will contain the benefits of a credit card. Go through 
                    the website and find all the benefits that the credit card offers if they were to sign up. An example of a benefit you may find is 
                    "payment for standard towing up to 5 miles" or "Cellphone protection incase you lose your cellphone".
                    Not all credit cardsqyzovodxmf will offer the same benefits, so go throughly through each section to each benefit.
                    Return this information as an array of JSON objects, each formatted that follows this example:
                    benefits:[
                        {
                            "Benefit Name": "Free Towing",
                            "description": "Free towing up to 5 miles if you lose your cellphone."
                        },
                        {
                            "benefit": "Cellphone protection",
                            "description": "If you lose your cellphone, we will pay for it's replacement."
                        }
                    ]
                    `,

                    role: 'user',
                    content: `${benefitsURL} \nThis text has information regarding the benefits of a credit card. Read it, and summarize the benefits of the product in it.`,

                    role: 'assistant',
                    content: 'Return an array of benefits in a json structure: [Benefit name: description]. If there is no benefits, return an empty array.'

                }
            ],
        })

    if(!response.choices || response.choices.length === 0){
        throw new Error('No choices found in the response')
    }

    const message = response.choices[0].message.content
    return message
    }catch(err){
        console.error('Error reading benefits:', err)
        throw err
    }
}

*/

