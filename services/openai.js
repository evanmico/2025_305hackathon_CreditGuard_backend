import openai from 'openai';


const openaiClient = new openai.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function readBenefits(text) {
    try{


        const response = await openaiClient.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are an AI that will read incoming text for signing up for a credit card into JSON format. 
                    Summarize the text and return the benefits of the product in it. If there are no benefits, return an empty array.`,
                    
                    role: 'user',
                    content: `${text} \nThis text has information regarding the benefits of a credit card. Read it, and summarize the benefits of the product in it.`,

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

